import React, { useState, useEffect, useContext, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { DocumentContext } from '../contexts/DocumentContext';
import DetailPlanCard from './CardDocument';
// import { Button } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import styles from './Map.module.css';
import API from '../services/api';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import Legend from './Legend';

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

const markerPosition = [67.8636, 20.280];

const MapComponent = () => {
    const navigate = useNavigate();
    const position = [67.8558, 20.2253]; // Kiruna coordinates
    const [markers, setMarkers] = useState([]);
    const [municipalArea, setMunicipalArea] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const { loggedIn } = useContext(AuthContext);
    const [mouseCoords, setMouseCoords] = useState({ lat: null, lng: null });
    const mouseCoordsRef = useRef({ lat: null, lng: null });
    const { setDocumentList } = useContext(DocumentContext);
    const [isSelecting, setIsSelecting] = useState(false); // New state for selection mode
    const [changingDocument, setChangingDocument] = useState(null);

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

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const documents = await API.getDocuments();
                console.log("Documenti ricevuti:", documents);
                setDocumentList(documents);

                const validMarkers = [];
                const invalidDocuments = [];

                documents.forEach(doc => {
                    const coordinates = doc.coordinates?.coordinates || null;
                    const [longitude, latitude] = coordinates || [];
                    console.log(`Verifica coordinate per il documento ${doc.title || "senza titolo"}: [${longitude}, ${latitude}]`);

                    if (!coordinates || longitude == null || latitude == null) {
                        invalidDocuments.push(doc);
                    } else {
                        validMarkers.push({
                            ...doc,
                            longitude: parseFloat(longitude),
                            latitude: parseFloat(latitude)
                        });
                    }
                });

                //console.log("Documenti validi:", validMarkers);
                //console.log("Documenti scartati:", invalidDocuments);

                setMarkers(validMarkers);
                setMunicipalArea(invalidDocuments);
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
                mouseCoordsRef.current = { 
                    lat: e.latlng.lat.toFixed(5), 
                    lng: e.latlng.lng.toFixed(5) 
                };
            },
            click: (e) => {
                // Naviga alla creazione documento se in modalità selezione
                if (isSelecting && loggedIn && changingDocument == null) {
                    navigate('/document-creation', { state: { coordinates: e.latlng } });
                    setIsSelecting(false);
                    return;
                }
    
                // Aggiorna le coordinate di un documento esistente
                if (changingDocument) {
                    const { lat, lng } = e.latlng;
                    
                    // Aggiorna i marker localmente
                    setMarkers(prevMarkers =>
                        prevMarkers.map(marker =>
                            marker._id === changingDocument._id
                                ? { ...marker, latitude: lat, longitude: lng }
                                : marker
                        )
                    );
    
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
        <div className={styles.mapContainer}>
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <MapMouseEvents />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                <Polygon
                    positions={kirunaPolygonCoordinates}
                    color="gray"
                    fillColor="#D3D3D3"
                    fillOpacity={0.4}
                />


                {/* Display discarded documents as markers at distinct locations */}
                {/*municipalArea.map((doc, index) => {
                    // Calculate offsets to place each marker slightly apart
                    const offset = 0.001 * index; // Change this value to adjust the distance
                    const markerPosition = [
                        67.881950910 - offset,
                        20.18 + 5 * offset
                    ];
                    return (
                        <Marker
                            key={`discarded-${index}`}
                            position={markerPosition}
                            icon={documentIcon}
                            eventHandlers={{ click: () => setSelectedMarker(doc) }}
                        >
                            <Popup maxWidth={800} minWidth={500} maxHeight={500} className={styles.popup}>
                                <DetailPlanCard
                                    doc={selectedMarker}
                                    onClose={() => setSelectedMarker(null)}
                                />
                            </Popup>
                            <Tooltip direction="bottom">{doc.title}</Tooltip> {/* Tooltip with offset below the marker }
                        </Marker>
                    );
                })*/}

                <MarkerClusterGroup
                    showCoverageOnHover={false}
                    disableClusteringAtZoom={16}
                    iconCreateFunction={createClusterIcon}
                >
                    {markers.map((marker, index) => (
                        <Marker
                            key={index}
                            position={[marker.latitude, marker.longitude]}
                            icon={new L.Icon({
                                iconUrl: marker.icon,
                                iconSize: [28, 28],
                                iconAnchor: [16, 32],
                                popupAnchor: [0, -32]
                            })}
                            eventHandlers={{
                                click: () => setSelectedMarker({
                                    doc: marker,
                                    position: [marker.latitude, marker.longitude]
                                })
                            }}
                        >
                            <Tooltip direction="bottom">{marker.title}</Tooltip>
                        </Marker>
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

                        <Tooltip direction="bottom">Municipal Area related documents</Tooltip> {/* Tooltip with offset below the marker*/}
                    </Marker>}
            </MapContainer>

            <Legend markers={markers} />

            {loggedIn && (
                <button
                    className={`${styles.addButton} ${isSelecting ? styles.expanded : ''}`}
                    onClick={() => setIsSelecting(prev => !prev)}
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
                </button>
            )}
        </div>
    );
};

export default MapComponent;
