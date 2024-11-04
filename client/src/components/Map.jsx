import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
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
    const [markers, setMarkers] = useState([]); // Array of markers
    const [selectedMarker, setSelectedMarker] = useState(null); 
    const { loggedIn } = useContext(AuthContext);
    const [mouseCoords, setMouseCoords] = useState({ lat: null, lng: null }); // Stato per le coordinate del mouse
    const [newDocumentCoords, setNewDocumentCoords] = useState(null); // Stato per le coordinate del nuovo documento
    const [isSelecting, setIsSelecting] = useState(false); // Stato per gestire la modalità di selezione

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const documents = await API.getDocuments();
                console.log("Fetched documents:", documents);
                
                const validMarkers = documents.map(doc => {
                    const [longitude, latitude] = doc.coordinates?.coordinates || [];
                    if (longitude == null || latitude == null) {
                        console.warn(`Skipping marker with invalid coordinates: ${JSON.stringify(doc)}`);
                        return null;
                    }

                    // Parse coordinates to ensure they are numbers
                    return {
                        ...doc,
                        longitude: parseFloat(longitude),
                        latitude: parseFloat(latitude)
                    };
                }).filter(doc => doc !== null);

                setMarkers(validMarkers); 
                console.log("Valid markers:", validMarkers);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            }
        };

        fetchDocuments();
    }, []);

    // Hook per catturare il movimento del mouse e aggiornare le coordinate
    const MapMouseEvents = () => {
        useMapEvents({
            mousemove: (e) => {
                setMouseCoords({ lat: e.latlng.lat.toFixed(5), lng: e.latlng.lng.toFixed(5) });
            },
            click: (e) => {
                if (isSelecting && loggedIn) { // Cattura le coordinate solo se la modalità di selezione è attiva
                    setNewDocumentCoords(e.latlng); // Imposta le coordinate del nuovo documento
                    navigate('/document-creation', { state: { coordinates: e.latlng } }); // Naviga al form con le coordinate
                    setIsSelecting(false); // Disabilita la modalità di selezione dopo aver cliccato
                }
            }
        });
        return null;
    };

    // Redirect to document creation page
    const handleButtonClick = () => {
        if (loggedIn) {
            setIsSelecting(true); // Attiva la modalità di selezione
        }
    };

    // Handle marker click to show details
    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
    };

    return (
        <div className={styles.mapContainer}>
            {/* Barra in alto per mostrare le coordinate del mouse */}
            {isSelecting && (
                <div className={styles.coordinatesBar}>
                    {mouseCoords.lat && mouseCoords.lng ? (
                        `Coordinate: ${mouseCoords.lat}, ${mouseCoords.lng}`
                    ) : (
                        'Muovi il mouse sulla mappa per vedere le coordinate'
                    )}
                </div>
            )}
            
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <MapMouseEvents /> {/* Component per catturare il movimento del mouse */}

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {markers.map((marker, index) => (
                    <Marker 
                        key={index} 
                        position={[marker.latitude, marker.longitude]} 
                        icon={documentIcon}
                        eventHandlers={{ click: () => handleMarkerClick(marker) }}
                    >
                        <Popup maxWidth={800} minWidth={500} maxHeight={500} className={styles.popup}>
                            <DetailPlanCard 
                                doc={selectedMarker} 
                                onClose={() => setSelectedMarker(null)} 
                            />
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {loggedIn && <Button className={styles.addButton} onClick={handleButtonClick}>Add Document</Button>}
        </div>
    );
};

export default MapComponent;
