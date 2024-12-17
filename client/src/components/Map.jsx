
import React, { useState,  useContext, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap,  Polygon, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { DocumentContext } from '../contexts/DocumentContext';
import { useMapLayoutContext } from '../contexts/MapLayoutContext';
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
import Municipality from './Municipality';
import API from '../services/api';
import kirunaGeoJSON from '../data/KirunaMunicipality.json';
import { SelectionState } from './SelectionState'; 


function RecenterMap({ newPosition, isListing, selectedMarker, isVisualizingMunicipality }) {
    const map = useMap();

    let pos = newPosition;
    
    if(isVisualizingMunicipality){
        map.fitBounds(kirunaPolygonCoordinates);
        pos = [68.2636, 19.000];
        //map.setZoom(7);
        if(selectedMarker != null)
            pos =  [68.2636, 16.000];
    }
    else{
        if(selectedMarker == null) return null;
        if (isListing) {
            const mapSize = map.getSize();
            const offsetX = mapSize.x * 0.28; // 35vw is the list width
            const point = map.latLngToContainerPoint(pos);
            point.x -=  offsetX;
            pos = map.containerPointToLatLng(point);
        }
    } 
    console.log("pos", pos);
    map.setView(pos, map.getZoom());
}

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
    ({ marker, onClick }) => (
      <Marker
        position={[marker.latitude, marker.longitude]}
        icon={
          new L.Icon({
            iconUrl: marker.icon,
            iconSize: [28, 28],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          })
        }
        eventHandlers={{ click: onClick }}
      >
        <Tooltip direction="bottom">{marker.title}</Tooltip>
      </Marker>
    ),
    (prevProps, nextProps) => 
      prevProps.marker.latitude === nextProps.marker.latitude &&
      prevProps.marker.longitude === nextProps.marker.longitude &&
      prevProps.marker.icon === nextProps.marker.icon
  );
  
  const MemoizedAreaMarker = React.memo(
    ({ area, onClick }) => (
      <Marker
        position={[
          area.properties.centroid.coordinates[1],
          area.properties.centroid.coordinates[0],
        ]}
        icon={multipleDocumentsIcon}
        eventHandlers={{ click: onClick }}
      >
        <Tooltip direction="bottom">Area related documents</Tooltip>
      </Marker>
    ),
    (prevProps, nextProps) => 
      prevProps.area._id === nextProps.area._id &&
      prevProps.area.properties.centroid.coordinates[0] ===
        nextProps.area.properties.centroid.coordinates[0] &&
      prevProps.area.properties.centroid.coordinates[1] ===
        nextProps.area.properties.centroid.coordinates[1]
  );
  
  const MemoizedPolygon = React.memo(
    ({ area }) => (
      <Polygon
        key={`${area._id}_Polygon`}
        positions={area.geometry.coordinates.map((ring) =>
          ring.map(([longitude, latitude]) => [latitude, longitude])
        )}
        color={area.properties.color}
      />
    ),
    (prevProps, nextProps) => 
      prevProps.area._id === nextProps.area._id &&
      JSON.stringify(prevProps.area.geometry.coordinates) ===
        JSON.stringify(nextProps.area.geometry.coordinates)
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
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const { loggedIn } = useContext(AuthContext);
    const {position, setPosition, selectedMarker, setSelectedMarker, setHighlightedNode, setVisualizeDiagram, handleDocCardVisualization} = useContext(DocumentContext);
    const [isAddingDocument, setIsAddingDocument] = useState(SelectionState.NOT_IN_PROGRESS); // Selection state
    const [isListing, setIsListing] = useState(false); 
    const { documents, markers, displayedAreas, municipalArea, setMapMarkers, setListContent, addArea } = useContext(DocumentContext);
    const [satelliteView, setSatelliteView] = useState(true);
    const [toggleDrawing, setToggleDrawing] = useState(false);
    const [confirmSelectedArea, setConfirmSelectedArea] = useState(false);
    const [addButton, setAddButton] = useState(null);
    const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    const { isMapHigh } = useMapLayoutContext();
    const [isVisualizingMunicipality, setIsisualizingMunicipality] = useState(false);


    useEffect(() => {
        // Function to update the map's size
        const handleResize = () => {
            if (mapRef.current) {
                mapRef.current.invalidateSize(); // Force the map to re-render
            }
        };

        // Set up the ResizeObserver
        const resizeObserver = new ResizeObserver(() => {
            handleResize(); // Call the function whenever the container's size changes
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Cleanup: disconnect the ResizeObserver when the component unmounts
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // Handler to update filtered documents on map
    const handleFilterByTitle = (title) => {
        console.log("title ", title);
        if(!title || title === "All"){
            setMapMarkers();
            handleDocCardVisualization(null);
        }
        else{
            setMapMarkers((doc) => doc.title === title);//passing the filter
            const doc = documents.find(doc => doc.title === title);
            handleDocCardVisualization(doc);
        }
    };

    // Handler to update filtered documents on list
    const handleFilterByTitleInList = (title) => {
        console.log("title ", title);
        if(!title || title === "All"){
            setListContent();
        }
        else{
            setListContent((doc) => doc.title === title);//passing the filter
        }
    };

    const handleCloseList = () => {
        setIsListing(false);
        if(isVisualizingMunicipality){
            setIsisualizingMunicipality(false);
        }
    };

    
    const handlePolygonDrawn = async (polygonLayer) => {
        try {
            const area = await API.createArea(polygonLayer.toGeoJSON());
            addArea(area);
            console.log("Area successfully created.");
            navigate('/document-creation', { state: { customArea: area } });
        } catch (error) {
            console.error("Error during area creation:", error.message);
        }
    };

    const handleChangeCoordinates = (doc) => {
        setChangingDocument(doc);
        setIsAddingDocument(SelectionState.IS_CHOOSING_THE_MODE); // Start selecting mode
    };

    return (
        <div ref={containerRef} className={styles.mapPage}>
            <div className={styles.mapContainer} >
            {/*loggedIn &&*/ !isListing && <SearchBar onFilter={handleFilterByTitle} inMap={true} /> }
            <MapContainer 
                center={position} 
                zoom={8} 
                className={` ${isListing ? styles.listing : styles.mapContainer}`} 
                zoomControl={false}
                ref={mapRef}
            >
                    {<AddDocumentButton 
                        isAddingDocument={isAddingDocument}
                        setIsAddingDocument={setIsAddingDocument} 
                        kirunaPolygonCoordinates={kirunaPolygonCoordinates} 
                        setToggleDrawing={setToggleDrawing} 
                        setConfirmSelectedArea={setConfirmSelectedArea}
                    /> }
                    <RecenterMap newPosition={position} isListing={isListing} selectedMarker={selectedMarker} isVisualizingMunicipality={isVisualizingMunicipality} />

                    <DrawingMap onPolygonDrawn={handlePolygonDrawn} limitArea={kirunaPolygonCoordinates} EnableDrawing={toggleDrawing} confirmSelectedArea={confirmSelectedArea}/>

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

                    {kirunaPolygonCoordinates.map((polygonCoordinates) => (
                        <Polygon
                            key={JSON.stringify(polygonCoordinates)} // Generate a unique key using the coordinates
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
                                        onClick={() => {
                                            setSelectedMarker({
                                                doc: marker,
                                                position: [marker.latitude, marker.longitude]
                                            });
                                        
                                            setHighlightedNode(marker._id);
                                            setPosition([marker.latitude, marker.longitude]);

                                        }
                                        }

                                    />
                                
                                ))
                            }

                            {displayedAreas.length > 0 &&
                                displayedAreas.map((area) => (
                                <React.Fragment key={area._id}>
                                    <MemoizedAreaMarker
                                    area={area}
                                    onClick={() => {
                                        setListContent((doc) => doc.areaId === area._id);
                                        if (loggedIn) setAddButton(area);
                                        setIsListing(true);
                                        handleDocCardVisualization(null);  
                                    }}
                                    />
                                    <MemoizedPolygon area={area} />
                                </React.Fragment>
                                ))
                            }

                        </MarkerClusterGroup>

                    </>
                    }
                </MapContainer>

                <Legend isListing={isListing}/>

                {municipalArea &&
                    <Municipality isListing={isListing} onClick={() => { 
                        setListContent((doc) => doc.areaId === null);
                        setAddButton(null);
                        handleDocCardVisualization(null);
                        if(isVisualizingMunicipality){
                            handleCloseList();
                        }
                        else{
                            setIsListing(true);
                            setIsisualizingMunicipality(true);
                        }
                    }}/>
                }

                {selectedMarker && (
                    <DetailPlanCard
                        doc={selectedMarker.doc}
                        onClose={() => handleDocCardVisualization(null)}
                        onChangeCoordinates={handleChangeCoordinates}
                        onToggleSelecting={setIsAddingDocument}
                        isListing={isListing}
                    />

                )}

                {isListing  
                && <ScrollableDocumentsList visualizeCard={handleDocCardVisualization} closeList={handleCloseList} handleFilterByTitleInList={handleFilterByTitleInList} handleFilterByTitle={handleFilterByTitle} addButton={addButton}/>}

                {/* ------------------- BUTTONS ---------------------------------------------------------------------- */}
                <div className={` ${!isMapHigh && loggedIn ? styles.buttonRow : styles.buttonCol }`}>

                    {/* DOCUMENT LIST BUTTON */}
                    {loggedIn && (
                        <button
                        className={`${styles.listButton}`}
                        onClick={() => { setIsListing(prev => !prev); setListContent() }}
                        >
                            <i className="bi bi-list-task"></i>
                        </button>        
                    )}

                    {/* CHANGE MAP VIEW BUTTON */}
                    <button
                        className={`${styles.satelliteButton}`}
                        onClick={() => { setSatelliteView(prev => !prev); }}
                        >
                            <MdSatelliteAlt />
                    </button>
                    
                    
                    {/* VIEW DIAGRAM BUTTON */}
                    <button
                        className={`${styles.diagramButton}`}         
                        onClick={() => { setVisualizeDiagram(prev => !prev); }}
                        >
                            <i className="bi bi-graph-up"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapComponent;
