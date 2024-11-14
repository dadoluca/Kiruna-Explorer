import React, { useState, useEffect, useContext } from 'react';
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

const documentIcon = new L.Icon({
    iconUrl: '/google-docs.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const MapComponent = () => {
    const navigate = useNavigate();
    const position = [67.8558, 20.2253]; // Kiruna coordinates
    const [markers, setMarkers] = useState([]); // Array of valid markers
    const [municipalArea, setMunicipalArea] = useState([]); // Array for discarded documents
    const [selectedMarker, setSelectedMarker] = useState(null);
    const { loggedIn } = useContext(AuthContext);
    const [mouseCoords, setMouseCoords] = useState({ lat: null, lng: null }); // Mouse coordinates
    const [isSelecting, setIsSelecting] = useState(false); // Selection state
    const { setDocumentList } = useContext(DocumentContext);

    const kirunaPolygonCoordinates = [
        [67.881950910, 20.18],  // Top-left point
        [67.850, 20.2100],      // Clockwise
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

                console.log("Documenti validi:", validMarkers);
                console.log("Documenti scartati:", invalidDocuments);

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
                const { lat, lng } = e.latlng;
                if (isPointInPolygon({ lat, lng }, kirunaPolygonCoordinates)) {
                    setMouseCoords({ lat: lat.toFixed(5), lng: lng.toFixed(5) });
                } else {
                    setMouseCoords({ lat: null, lng: null });
                }
            },
            click: (e) => {
                if (isSelecting && loggedIn) {
                    const { lat, lng } = e.latlng;
                    if (isPointInPolygon({ lat, lng }, kirunaPolygonCoordinates)) {
                        navigate('/document-creation', { state: { coordinates: e.latlng } });
                        setIsSelecting(false);
                    }
                }
            }
        });
        return null;
    };

    // Function to navigate to document creation form for the entire municipality
    const handleAssignToMunicipalArea = () => {
        navigate('/document-creation', { state: { isMunicipal: true } });
    };

    return (
        <div className={styles.mapContainer}>
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
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

                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        position={[marker.latitude, marker.longitude]}
                        icon={documentIcon}
                        eventHandlers={{ click: () => setSelectedMarker(marker) }}
                    >
                        <Popup maxWidth={800} minWidth={500} maxHeight={500} className={styles.popup}>
                            <DetailPlanCard
                                doc={selectedMarker}
                                onClose={() => setSelectedMarker(null)}
                            />
                        </Popup>
                        <Tooltip direction="bottom">{marker.title}</Tooltip>
                    </Marker>
                ))}

                {municipalArea.map((doc, index) => {
                    const offset = 0.001 * index;
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
                            <Tooltip direction="bottom">{doc.title}</Tooltip>
                        </Marker>
                    );
                })}
            </MapContainer>

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
                                        Insert the point in ({parseFloat(mouseCoords.lat).toFixed(4)}, {parseFloat(mouseCoords.lng).toFixed(4)}) or choose the {"  "}
                                        <button
                                            className={styles.buttonLink}
                                            onClick={handleAssignToMunicipalArea}
                                        >
                                            Entire Municipality
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Move the mouse inside the area or chose the {"  "}
                                        <button
                                            className={styles.buttonLink}
                                            onClick={handleAssignToMunicipalArea}
                                        >
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
