import React, { useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapEvents} from 'react-leaflet';
import { AuthContext } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import kirunaGeoJSON from '../data/KirunaMunicipality.json';
import styles from './Map.module.css';

function AddDocumentButton({ isSelecting, setIsSelecting, kirunaPolygonCoordinates }) {
    const navigate = useNavigate();
    const [changingDocument, setChangingDocument] = useState(null);
    const { loggedIn } = useContext(AuthContext);
    const [mouseCoords, setMouseCoords] = useState({ lat: null, lng: null }); // Mouse coordinates

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

    const handleAssignToMunicipalArea = () => {
        navigate('/document-creation', { state: { isMunicipal: true } });
    };

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
                if (isSelecting && loggedIn && changingDocument == null) {
                    const isInAnyPolygon = kirunaPolygonCoordinates.some(polygon => 
                      isPointInPolygon(mouseCoords, polygon)
                    );
                  
                    if (isInAnyPolygon) {
                      navigate('/document-creation', { state: { coordinates: e.latlng } });
                      setIsSelecting(false);
                      return;
                    }
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

    return (
        <>
        <MapMouseEvents />
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
                                    Move the mouse inside the area or chooose the{" "}
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
        </>
    );
}

export default AddDocumentButton;