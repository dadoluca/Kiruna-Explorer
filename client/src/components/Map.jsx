import React from 'react';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import DetailPlanCard from './CardDocument';
import { useNavigate } from 'react-router-dom';
import { Button  } from 'react-bootstrap';

const MapComponent = () => {
    const navigate = useNavigate();

    const position = [67.8558, 20.2253]; //Kiruna coordinates
    const [showForm, setShowForm] = useState(false);  //forrm flag
    const [markers, setMarkers] = useState([]);       //marker array, each marker is referred to a document
    const [selectedMarker, setSelectedMarker] = useState(null); 

    //retrieve markers from Backend API 
    //TO ADD

    //Function for managing button click
    const handleButtonClick = () => {
        navigate('/document-creation');
    };

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
    
    //Function for managing marker click
    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
    };

    return (
        <div className="mapCont">
            <Button variant="dark" onClick={handleButtonClick}>Add Document</Button>
            <MapContainer center={position} zoom={13} style={{ height: '590px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

            {markers.map((marker, index) => (
                <Marker key={index} position={[marker.latitude, marker.longitude]} eventHandlers={{ click: () => handleMarkerClick(marker) }}>
                    <Popup>
                    <DetailPlanCard doc={selectedMarker} onClose={() => setSelectedMarker(null)} />
                    </Popup>
                </Marker>
                ))
            }
            </MapContainer>
        </div>
    );
};

export default MapComponent;
