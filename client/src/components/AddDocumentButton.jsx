import React, { useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapEvents} from 'react-leaflet';
import { AuthContext } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import styles from './Map.module.css';
import { SelectionState } from './SelectionState'; 
import  CloseModeSelectionButton  from './CloseModeSelectionButton';

function AddDocumentButton({ isAddingDocument, setIsAddingDocument, kirunaPolygonCoordinates }) {
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

    const handleChooseNewPoint = () => {
        setIsAddingDocument(SelectionState.NEW_POINT);
    }

    const handleSelectExistingPoint = () => {
        setIsAddingDocument(SelectionState.EXISTING_POINT);
    };

    const MapMouseEvents = () => {
        useMapEvents({
            mousemove: (e) => {
                // Aggiorna le coordinate correnti del mouse
                if (isAddingDocument == SelectionState.NEW_POINT && loggedIn && changingDocument == null ) {
                    const newCoords = { 
                    lat: e.latlng.lat.toFixed(5), 
                    lng: e.latlng.lng.toFixed(5) 
                    };
                    setMouseCoords(newCoords);
                }
            },
            click: (e) => {

                // Naviga alla creazione documento se in modalità selezione
                if (isAddingDocument == SelectionState.NEW_POINT && loggedIn && changingDocument == null) {
                    const isInAnyPolygon = kirunaPolygonCoordinates.some(polygon => 
                      isPointInPolygon(mouseCoords, polygon)
                    );
                  
                    if (isInAnyPolygon) {
                        console.log(e.latlng);
                      navigate('/document-creation', { state: { coordinates: e.latlng } });
                      setIsAddingDocument(SelectionState.NOT_IN_PROGRESS);
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
                    setIsAddingDocument(SelectionState.NOT_IN_PROGRESS);
                }
            }
        });
    
        return null;
    };

    return (
        <>
        {isAddingDocument == SelectionState.NEW_POINT && 
            <MapMouseEvents />
        }

        {/* ---------------- add document button ---------------- */}
        {loggedIn && (
            <div
                className={`
                    ${styles.addButton} 
                    ${isAddingDocument == SelectionState.IS_CHOOSING_THE_MODE ||
                        isAddingDocument == SelectionState.NEW_POINT
                        ? styles.expanded : ''}`}
                tabIndex={0}
            >
                {isAddingDocument == SelectionState.IS_CHOOSING_THE_MODE && (
                    <>
                       <div>
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
                            <div className={styles.spazio}></div>
                        </div>
                    </>
                )}

                {isAddingDocument == SelectionState.NEW_POINT && mouseCoords.lat && mouseCoords.lng && (
                    <>              
                        Insert the point in ({mouseCoords.lat}, {mouseCoords.lng})
                        <div className={styles.spazio}></div>
                    </>
                )}

                {isAddingDocument != SelectionState.NOT_IN_PROGRESS ? (
                        <CloseModeSelectionButton onClick={() => {setIsAddingDocument(SelectionState.NOT_IN_PROGRESS)}}/>
                    )
                    :
                    (   
                        <button
                            style={{backgroundColor: 'transparent', color: 'white', border: 'none'}}
                            onClick={() => setIsAddingDocument(SelectionState.IS_CHOOSING_THE_MODE)}
                        >
                            <FontAwesomeIcon icon={faPlus}/>
                        </button>
                    )
                }

            </div>
        )}
        </>
    );
}

export default AddDocumentButton;