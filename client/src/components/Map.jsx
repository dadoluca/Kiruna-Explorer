import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import DetailPlanCard from './CardDocument';
import { Button } from 'react-bootstrap';
import styles from './Map.module.css';

const MapComponent = () => {
    const navigate = useNavigate();
    const position = [67.8558, 20.2253]; // Kiruna coordinates
    const [markers, setMarkers] = useState([]); // Array of markers
    const [selectedMarker, setSelectedMarker] = useState(null); 

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
                        eventHandlers={{ click: () => handleMarkerClick(marker) }}
                    >
                        <Popup>
                            <DetailPlanCard 
                                doc={selectedMarker} 
                                onClose={() => setSelectedMarker(null)} 
                            />
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <Button className={styles.addButton} onClick={handleButtonClick}>
                Add Document
            </Button>
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