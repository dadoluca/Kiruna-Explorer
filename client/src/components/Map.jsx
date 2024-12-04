import React, { useState,  useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup,  Polygon, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { DocumentContext } from '../contexts/DocumentContext';
import DetailPlanCard from './CardDocument';
import { AuthContext } from '../contexts/AuthContext';
import styles from './Map.module.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import Legend from './Legend';
import ScrollableDocumentsList from './ListDocument';
import SearchBar from './SearchBar';
import DrawingMap from './DrawingMap';
import { MdSatelliteAlt } from "react-icons/md";            //satellite icon for button
import AddDocumentButton from './AddDocumentButton';
import API from '../services/api';
import kirunaGeoJSON from '../data/KirunaMunicipality.json';
import { SelectionState } from './SelectionState'; 



const kirunaPolygonCoordinates = kirunaGeoJSON.features[0].geometry.coordinates.map(polygon =>
    polygon[0].map(
      ([lng, lat]) => [lat, lng]
    )
);

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


const MemoizedSelectPointMarker = React.memo(
    ({ marker, onClick }) => {
        const markerRef = React.useRef(null);

        const handleMouseOver = () => {
            if (markerRef.current) {
                markerRef.current._icon.style.filter = 'brightness(0.5)'; //  hover 
            }
        };

        const handleMouseOut = () => {
            if (markerRef.current) {
                markerRef.current._icon.style.filter = 'brightness(1)'; // remove hover
            }
        };

        return (
            <Marker
                ref={markerRef}
                position={[marker.latitude, marker.longitude]}
                eventHandlers={{
                    click: onClick,
                    mouseover: handleMouseOver,
                    mouseout: handleMouseOut,
                }}
            >
                <Tooltip>{marker.latitude}, {marker.longitude}</Tooltip>
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
    const position = [68.1, 20.4]; // Kiruna coordinates
    const [selectedMarker, setSelectedMarker] = useState(null);
    const { loggedIn } = useContext(AuthContext);
    const [isAddingDocument, setIsAddingDocument] = useState(SelectionState.NOT_IN_PROGRESS); // Selection state
    const [isListing, setIsListing] = useState(false); // Listing state SET TO TRUE FOR TESTING
    const { markers, displayedAreas, municipalArea, setMapMarkers, setListContent, isAddingToPoint } = useContext(DocumentContext);
    const [customArea, setCustomArea] = useState(null);
    const [satelliteView, setSatelliteView] = useState(true);
    const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    // Handler to update filtered documents on map
    const handleFilterByTitle = (title) => {
        console.log("title ", title);
        if(!title || title === "All")
            setMapMarkers();
        else
            setMapMarkers((doc) => doc.title === title);//passing the filter
    };

    // Handler to update filtered documents on list
    const handleFilterByTitleInList = (title) => {
        console.log("title ", title);
        if(!title || title === "All")
            setListContent();
        else
            setListContent((doc) => doc.title === title);//passing the filter
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

    
    const handlePolygonDrawn = (polygonLayer) => {
        setCustomArea(polygonLayer);
        console.log("Poligono ricevuto nel padre:", polygonLayer.getLatLngs());
        API.createArea(polygonLayer.getLatLngs());
    };


    const handleChangeCoordinates = (doc) => {
        setChangingDocument(doc);
        setIsAddingDocument(SelectionState.IS_CHOOSING_THE_MODE); // Start selecting mode
    };

    return (
        <div className={styles.mapPage}>
            <div className={styles.mapContainer} >
            {loggedIn && !isListing && <SearchBar onFilter={handleFilterByTitle} /> }
            <MapContainer 
                center={position} 
                zoom={8} 
                className={` ${isListing ? styles.listing : styles.mapContainer}`} 
                zoomControl={false}
            >
                    {<AddDocumentButton isAddingDocument={isAddingDocument} setIsAddingDocument={setIsAddingDocument} kirunaPolygonCoordinates={kirunaPolygonCoordinates}/> }

                    <DrawingMap onPolygonDrawn={handlePolygonDrawn} limitArea={kirunaPolygonCoordinates}/>

                    {satelliteView ? (
                        <TileLayer
                        url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${accessToken}`}
                        attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        id="mapbox/satellite-v9"
                      />
                      ) : (
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                    )}



                    {kirunaPolygonCoordinates.map((polygonCoordinates, index) => (
                        <Polygon
                            key={index}
                            positions={polygonCoordinates}
                            color="gray"
                            fillColor="#D3D3D3"
                            fillOpacity={0.4}
                        />
                    ))}

                    {
                    
                    isAddingDocument === SelectionState.EXISTING_POINT
                    ?
                        <>
                        {
                             markers
                                .filter(marker => marker.areaId === undefined)
                                .map((marker) => (
                                <MemoizedSelectPointMarker
                                    key={marker._id}
                                    marker={marker}
                                    onClick={() => {navigate('/document-creation', { state: { coordinates: { lat: marker.latitude, lng: marker.longitude } } });}}
                                />
                         
                         ))
                        }
                        </>
                    :

                    <>
                        <MarkerClusterGroup
                            showCoverageOnHover={false}
                            iconCreateFunction={createClusterIcon}
                        >
                            {
                                markers
                                    .filter(marker => marker.areaId === undefined)
                                    .map((marker) => (
                                    <MemoizedMarker
                                        key={marker._id}
                                        marker={marker}
                                        onClick={() => setSelectedMarker({
                                            doc: marker,
                                            position: [marker.latitude, marker.longitude]
                                        })}
                                    />
                                
                                ))
                            }

                            {displayedAreas.length > 0 &&
                                displayedAreas.map((area) => (
                                    <Marker
                                        key={area._id}
                                        position={[area.properties.centroid[1], area.properties.centroid[0]]}
                                        icon={multipleDocumentsIcon}
                                        eventHandlers={{ click: () => { setListContent((doc) => doc.areaId === area._id); setIsListing(true) } }}
                                    >

                                        <Tooltip direction="bottom">Area related documents</Tooltip> 
                                    </Marker>
                                ))
                            }
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
                                    onToggleSelecting={setIsAddingDocument}
                                />
                            </Popup>
                        )}

                        {municipalArea &&
                            <Marker
                                position={markerPosition} // Use calculated position with offset
                                icon={multipleDocumentsIcon}
                                eventHandlers={{ click: () => { setListContent((doc) => doc.areaId === null); setIsListing(true) } }}
                            >

                                <Tooltip direction="bottom">Municipal Area related documents</Tooltip> 
                            </Marker>
                        }
                    </>
                    }
                </MapContainer>

                <Legend />


                {isListing  
                && <ScrollableDocumentsList handleVisualize={handleVisualization} closeList={handleCloseList} handleFilterByTitleInList={handleFilterByTitleInList}/>}

                

                <div className={styles.buttonGroupUI}>
                    <button
                        className={`${styles.satelliteButton}`}
                        onClick={() => { setSatelliteView(prev => !prev); }}
                        >
                            <MdSatelliteAlt />
                    </button>

                    {loggedIn && (
                        <button
                        className={`${styles.listButton}`}
                        onClick={() => { setIsListing(prev => !prev); setListContent() }}
                        >
                            <i className="bi bi-list-task"></i>
                        </button>
                    )}

            
                </div>
                
            </div>
        </div>
    );
};

export default MapComponent;
