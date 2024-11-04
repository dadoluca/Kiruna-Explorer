import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react'; 
import DetailPlanCard from './CardDocument';
import { Button } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';
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

    


    // Redirect to document creation page
    const handleButtonClick = () => {
        navigate('/document-creation');
    };

    // Handle marker click to show details
    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
    };

    return (
        <div className={styles.mapContainer}>
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
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






  /*
    //Function for managing form submission (used for static frontend testing)
    const handleFormSubmit = ({ title, scale, date, stakeholdersArray, type, connections, pages, language, latitude, longitude }) => {
        const newMarker = { 
            index: markers.length,
            title: title,
            scale: scale,
            date: date,
            stakeholders: stakeholdersArray,
            type: type,
            connections: connections,
            pages: pages,
            language: language,
            latitude: parseFloat(latitude), 
            longitude: parseFloat(longitude) };
        console.log(newMarker);
        setMarkers([...markers, newMarker]);    //add new marker to the array of markers(graphic rappresentation of the documents)                
    };
    */