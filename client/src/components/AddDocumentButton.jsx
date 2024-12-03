import React, { useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapEvents} from 'react-leaflet';
import { DocumentContext } from '../contexts/DocumentContext';
import { AuthContext } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './Map.module.css';

function AddDocumentButton({ isSelecting, setIsSelecting, kirunaPolygonCoordinates }) {
    const navigate = useNavigate();
    const [changingDocument, setChangingDocument] = useState(null);
    const { loggedIn } = useContext(AuthContext);
    const { setIsAddingToPoint } = useContext(DocumentContext);
    const [mouseCoords, setMouseCoords] = useState({ lat: null, lng: null }); // Mouse coordinates
    const [isChoosingNewPoint, setIsChoosingNewPoint] = useState(false);

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

    const handleChangeCoordinates = (doc) => {
        setChangingDocument(doc);
        setIsSelecting(true); // Start selecting mode
    };

    const handleChooseNewPoint = () => {
        setIsChoosingNewPoint(true);
        setIsSelecting(true);
    }

    const handleSelectExistingPoint = () => {
        setProva(true);
        setIsAddingToPoint(true);
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
        {
            isChoosingNewPoint && <MapMouseEvents />
        
        }
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
                            {isChoosingNewPoint && mouseCoords.lat && mouseCoords.lng ? (
                                <>  
                                     Insert the point in ({mouseCoords.lat}, {mouseCoords.lng}) 
                                </>
                            ) : (
                                <>
                                   <button className={styles.buttonLink} onClick={handleChooseNewPoint}>
                                        Choose a New Point
                                    </button>
                                    {" "}or{" "}
                                    <button className={styles.buttonLink} onClick={handleSelectExistingPoint}>
                                        Select an Existing Point
                                    </button>
                                    {" "}or{" "}
                                    <button className={styles.buttonLink} onClick={handleAssignToMunicipalArea}>
                                        Choose the Entire Municipality
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