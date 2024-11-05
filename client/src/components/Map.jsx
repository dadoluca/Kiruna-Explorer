import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { DocumentContext } from '../contexts/DocumentContext';
import DetailPlanCard from './CardDocument';
import { Button } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import styles from './Map.module.css';
import API from '../services/api';
import L from 'leaflet';

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
        [67.850, 20.2100],  // Clockwise
        [67.8410, 20.2000],
        [67.8260, 20.3000],
        [67.840, 20.310],
        [67.8350, 20.350],
        [67.850, 20.370],
        [67.860, 20.300]
    ];

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const documents = await API.getDocuments();
                console.log("Documenti ricevuti:", documents); // Log received documents
                setDocumentList(documents);

                const validMarkers = [];
                const invalidDocuments = [];

                documents.forEach(doc => {
                    const coordinates = doc.coordinates?.coordinates || null; // Handle structure
                    const [longitude, latitude] = coordinates || [];
                    console.log(`Verifica coordinate per il documento ${doc.title || "senza titolo"}: [${longitude}, ${latitude}]`); // Log coordinate check

                    if (!coordinates || longitude == null || latitude == null) {
                        invalidDocuments.push(doc); // Add to discarded documents
                    } else {
                        validMarkers.push({
                            ...doc,
                            longitude: parseFloat(longitude),
                            latitude: parseFloat(latitude)
                        });
                    }
                });

                console.log("Documenti validi:", validMarkers); // Log valid documents
                console.log("Documenti scartati:", invalidDocuments); // Log discarded documents

                setMarkers(validMarkers);
                setMunicipalArea(invalidDocuments); // Set discarded documents in municipalArea
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
                setMouseCoords({ lat: e.latlng.lat.toFixed(5), lng: e.latlng.lng.toFixed(5) });
            },
            click: (e) => {
                if (isSelecting && loggedIn) {
                    // Here we are setting new document coordinates
                    setMouseCoords(e.latlng);
                    navigate('/document-creation', { state: { coordinates: e.latlng } }); 
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
        navigate('/document-creation', { state: { isMunicipal: true } }); // Indicate assignment to the entire area
    };

    return (
        <div className={styles.mapContainer}>
            {isSelecting && (
                <div className={styles.coordinatesBar}>
                    {mouseCoords.lat && mouseCoords.lng ? (
                        <>
                            Insert the point in ({mouseCoords.lat}, {mouseCoords.lng}) or choose the {"  "}
                            <Button
                                className={styles.buttonLink}
                                onClick={handleAssignToMunicipalArea}
                            >
                                Entire Municipality
                            </Button>
                        </>
                    ) : (
                        'Muovi il mouse sulla mappa per vedere le coordinate'
                    )}
                </div>
            )}

            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <MapMouseEvents />

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <Polygon
                    positions={kirunaPolygonCoordinates}
                    color="gray"        // Border color
                    fillColor="#D3D3D3" // Light gray fill color
                    fillOpacity={0.5}   // Light effect opacity
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
                    </Marker>
                ))}

                {/* Display discarded documents as markers at distinct locations */}
                {municipalArea.map((doc, index) => {
                    // Calculate offsets to place each marker slightly apart
                    const offset = 0.001 * index; // Change this value to adjust the distance
                    const markerPosition = [
                        67.881950910 - offset, // Offset latitude
                        20.18 + 5 * (offset)  // Offset longitude
                    ];
                    return (
                        <Marker
                            key={`discarded-${index}`}
                            position={markerPosition} // Use calculated position with offset
                            icon={documentIcon}
                            eventHandlers={{ click: () => setSelectedMarker(doc) }}
                        >
                        <Popup maxWidth={800} minWidth={500} maxHeight={500} className={styles.popup}>
                            <DetailPlanCard
                                doc={selectedMarker}
                                onClose={() => setSelectedMarker(null)}
                            />
                        </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {loggedIn && (
                <Button className={styles.addButton} onClick={() => setIsSelecting(true)}>
                    +
                </Button>
            )}
        </div>
    );
};

export default MapComponent;
