import React, { useState, useEffect, useContext, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { DocumentContext } from '../contexts/DocumentContext';
import DetailPlanCard from './CardDocument';
import { AuthContext } from '../contexts/AuthContext';
import styles from './Map.module.css';
import API from '../services/api';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import Legend from './Legend';
import ScrollableDocumentsList from './ListDocument';
import SearchBar from './SearchBar';

const multipleDocumentsIcon = new L.Icon({
    iconUrl: '/multiple_docs.png',  // Point to backend URL
    iconSize: [40, 40],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const createClusterIcon = (cluster) => {
    const count = cluster.getChildCount();

    // Determine size based on count
    let clusterClass = styles.clusterSmall;
    if (count > 20) clusterClass = styles.clusterLarge;
    else if (count > 10) clusterClass = styles.clusterMedium;

    return L.divIcon({
        html: `<div class="${styles.clusterIcon} ${clusterClass}">${count}</div>`,
        className: '', // Use only custom class
        iconSize: L.point(40, 40, true),
    });
};

const MemoizedMarker = React.memo(
    ({ marker, onClick }) => {
        return (
            <Marker
                position={[marker.latitude, marker.longitude]}
                icon={new L.Icon({
                    iconUrl: marker.icon,
                    iconSize: [28, 28],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                })}
                eventHandlers={{
                    click: onClick
                }}
            >
                <Tooltip direction="bottom">{marker.title}</Tooltip>
            </Marker>
        );
    },
    (prevProps, nextProps) => {
        // Check if the important properties have changed (e.g., coordinates)
        return prevProps.marker.latitude === nextProps.marker.latitude &&
            prevProps.marker.longitude === nextProps.marker.longitude;
    }
);

const markerPosition = [67.8636, 20.280];

const MapComponent = () => {
    const navigate = useNavigate();
    const position = [67.8558, 20.2253]; // Kiruna coordinates
    const [selectedMarker, setSelectedMarker] = useState(null);
    const { loggedIn } = useContext(AuthContext);
    const [mouseCoords, setMouseCoords] = useState({ lat: null, lng: null }); // Mouse coordinates
    const [isSelecting, setIsSelecting] = useState(false); // Selection state
    const [isListing, setIsListing] = useState(false); // Listing state SET TO TRUE FOR TESTING
    const { documents, markers, municipalArea,  setDocumentList, setMapMarkers, updateDocCoords } = useContext(DocumentContext);
    const [changingDocument, setChangingDocument] = useState(null);
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    const kirunaPolygonCoordinates = [
        [67.881950910, 20.18],
        [67.850, 20.2100],
        [67.8410, 20.2000],
        [67.84037, 20.230],
        [67.8260, 20.288],
        [67.8365, 20.304],
        [67.842, 20.303],
        [67.844, 20.315],
        [67.8350, 20.350],
        [67.850, 20.370],
        [67.860, 20.300]
    ];

    // Function to check if a point is inside the polygon (Ray-casting algorithm)
    const isPointInPolygon = (point, vs) => {
        const [x, y] = [point.lat, point.lng];
        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const [xi, yi] = vs[i];
            const [xj, yj] = vs[j];
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    // Handler to update filtered documents
    const handleFilterByTitle = (title) => {
        console.log("title ", title);
        if(!title || title === "All")
            setMapMarkers();
        else
            setMapMarkers((doc) => doc.title === title);//passing the filter
    };

    const handleVisualization = (doc) => {
        setSelectedMarker({
            doc: doc,
            position: [doc.coordinates.coordinates[1], doc.coordinates.coordinates[0]]
        })
    };

    const handleCloseList = () => {
        setIsListing(false);
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const documents = await API.getDocuments();
                //console.log("Documenti ricevuti:", documents);
                setDocumentList(documents);
                console.log("Documenti ricevuti:", documents);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            }
        };

        fetchDocuments();
    }, []);

    

    // Hook for mouse movement and updating coordinates

    const MapMouseEvents = () => {
        useMapEvents({
            mousemove: (e) => {
                // Aggiorna le coordinate correnti del mouse
                if (isSelecting && loggedIn && changingDocument == null ) {
                    const newCoords = { 
                    lat: e.latlng.lat.toFixed(5), 
                    lng: e.latlng.lng.toFixed(5) 
                    };
                    setMouseCoords(newCoords);
                }
            },
            click: (e) => {
                // Naviga alla creazione documento se in modalità selezione
                if (isSelecting && loggedIn && changingDocument == null && isPointInPolygon(mouseCoords, kirunaPolygonCoordinates)) {
                    navigate('/document-creation', { state: { coordinates: e.latlng } });
                    setIsSelecting(false);
                    return;
                }
    
                // Aggiorna le coordinate di un documento esistente
                if (changingDocument) {
                    const { lat, lng } = e.latlng;
    
                    // Prepara le nuove coordinate
                    const updatedCoordinates = {
                        type: changingDocument.coordinates.type,
                        coordinates: [lng, lat] // Formato GeoJSON: [lng, lat]
                    };
    
                    // Aggiorna le coordinate sul server
                    API.updateDocumentCoordinates(
                        changingDocument._id,
                        updatedCoordinates.type,
                        updatedCoordinates.coordinates
                    )
                        .then(() => {
                            console.log('Coordinate aggiornate con successo');
                            updateDocCoords(changingDocument._id, updatedCoordinates.coordinates);
                            setMapMarkers();
                        })
                        .catch(err => {
                            console.error('Errore durante l\'aggiornamento delle coordinate:', err.message);
                        });
    
                    // Reset della modalità
                    setChangingDocument(null);
                    setIsSelecting(false);
                }
            }
        });
    
        return null;
    };
    
    // Handle polygon click event
    const handlePolygonClick = () => {
        console.log("Hai cliccato sul bordo del poligono!");
        alert("Bordo del poligono cliccato!");
    };

    // Function to navigate to document creation form for the entire municipality
    const handleAssignToMunicipalArea = () => {
        navigate('/document-creation', { state: { isMunicipal: true } });
    };

    const handleChangeCoordinates = (doc) => {
        setChangingDocument(doc);
        setIsSelecting(true); // Start selecting mode
    };

    return (
        <div className={styles.mapPage}>
            <div className={styles.mapContainer} >
                {loggedIn && !isListing && <SearchBar onFilter={handleFilterByTitle} /> }
            <MapContainer center={position} zoom={13} className={styles.mapContainer} zoomControl={false}>
                    <MapMouseEvents />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    <Polygon
                        positions={kirunaPolygonCoordinates}
                        color="gray"
                        fillColor="#D3D3D3"
                        fillOpacity={0.4}
                    />

                    <MarkerClusterGroup
                        showCoverageOnHover={false}
                        disableClusteringAtZoom={16}
                        iconCreateFunction={createClusterIcon}
                    >
                        {markers.map((marker) => (
                            <MemoizedMarker
                                key={marker._id}
                                marker={marker}
                                onClick={() => setSelectedMarker({
                                    doc: marker,
                                    position: [marker.latitude, marker.longitude]
                                })}
                            />
                        ))}
                    </MarkerClusterGroup>

                    {selectedMarker && (
                        <Popup
                            position={selectedMarker.position}
                            onClose={() => setSelectedMarker(null)}
                            maxWidth={800}
                            minWidth={500}
                            maxHeight={500}
                            className={styles.popup}
                        >
                            <DetailPlanCard
                                doc={selectedMarker.doc}
                                onClose={() => setSelectedMarker(null)}
                                onChangeCoordinates={handleChangeCoordinates}
                                onToggleSelecting={setIsSelecting}
                            />
                        </Popup>
                    )}

                    {municipalArea.length > 0 &&
                        <Marker
                            position={markerPosition} // Use calculated position with offset
                            icon={multipleDocumentsIcon}
                            eventHandlers={{ click: () => setSelectedMarker(doc) }}
                        >
                            {/*
                            *
                            *
                            * TODO: insert here the visualization of the list of document
                            * 
                            * 
                            * */}

                            <Tooltip direction="bottom">Municipal Area related documents</Tooltip> {/* Tooltip with offset below the marker*/ }
                        </Marker>}
                </MapContainer>

                <Legend />


                {isListing 
                && loggedIn 
                && <ScrollableDocumentsList handleVisualize={handleVisualization} closeList={handleCloseList}/>}

                {isListing 
                && loggedIn 
                && <SearchBar 
                    onFilter={handleFilterByTitle} />
                }

                <div className={styles.buttonGroupUI}>


                    {loggedIn && (
                        <button
                        className={`${styles.listButton}`}
                        onClick={() => setIsListing(prev => !prev)}
                        >
                            <i className="bi bi-list-task"></i>
                        </button>
                    )}

                    {loggedIn && (
                        <div
                            className={`${styles.addButton} ${isSelecting ? styles.expanded : ''}`}
                            onClick={() => setIsSelecting(prev => !prev)}
                            role="button"
                            tabIndex={0}
                        >
                            {isSelecting ? (
                                <>
                                    <div className={styles.coordinatesBar}>
                                        {mouseCoords.lat && mouseCoords.lng ? (
                                            <>
                                                Insert the point in ({mouseCoords.lat}, {mouseCoords.lng}) or choose the{" "}
                                                <button className={styles.buttonLink} onClick={handleAssignToMunicipalArea}>
                                                    Entire Municipality
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                Move the mouse inside the area or choose the{" "}
                                                <button className={styles.buttonLink} onClick={handleAssignToMunicipalArea}>
                                                    Entire Municipality
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <div className={styles.spazio}></div>
                                    <FontAwesomeIcon icon={faTimes} />
                                </>
                            ) : (
                                <FontAwesomeIcon icon={faPlus} />
                            )}
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
};

export default MapComponent;
