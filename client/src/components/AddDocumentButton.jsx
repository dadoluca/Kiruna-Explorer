import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapEvents } from 'react-leaflet';
import { AuthContext } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCirclePlus, faHouseChimney, faMapMarker, faPlus, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import styles from './Map.module.css';
import styl from './addDocumentButton.module.css';
import { SelectionState } from './SelectionState';
import CloseModeSelectionButton from './CloseModeSelectionButton';
import PropTypes from 'prop-types';

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
function AddDocumentButton({ isAddingDocument, setIsAddingDocument, kirunaPolygonCoordinates, setToggleDrawing, setConfirmSelectedArea }) {
    const navigate = useNavigate();
    const [changingDocument, setChangingDocument] = useState(null);
    const { loggedIn, isResident } = useContext(AuthContext);
    const [mouseCoords, setMouseCoords] = useState({ lat: null, lng: null }); // Mouse coordinates


const noXButton =
  isAddingDocument !== SelectionState.IS_CHOOSING_THE_MODE &&
  isAddingDocument !== SelectionState.NEW_POINT &&
  isAddingDocument !== SelectionState.NEW_AREA;


    const handleAssignToMunicipalArea = () => {
        navigate('/document-creation', { state: { isMunicipal: true } });
    };

    const handleChooseNewPoint = () => {
        setIsAddingDocument(SelectionState.NEW_POINT);
    }

    const handleSelectExistingPoint = () => {
        setIsAddingDocument(SelectionState.EXISTING_POINT);
    };

    const handleCreateNewArea = () => {
        setIsAddingDocument(SelectionState.NEW_AREA);
        setToggleDrawing(prev => !prev);
        setConfirmSelectedArea(false);
        console.log(isAddingDocument);

    };

    const handleConfirmNewArea = () => {
        setConfirmSelectedArea(prev => !prev);
        setToggleDrawing(prev => !prev);
    };

    const MapMouseEvents = () => {
        useMapEvents({
            mousemove: (e) => {
                // Aggiorna le coordinate correnti del mouse
                if (isAddingDocument == SelectionState.NEW_POINT && loggedIn  && !isResident && changingDocument == null) {
                    const newCoords = {
                        lat: e.latlng.lat.toFixed(5),
                        lng: e.latlng.lng.toFixed(5)
                    };
                    setMouseCoords(newCoords);
                }
            },
            click: (e) => {

                // Naviga alla creazione documento se in modalità selezione
                if (isAddingDocument == SelectionState.NEW_POINT && loggedIn && !isResident && changingDocument == null) {
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

            {loggedIn && !isResident &&(
                <div
                    className={`
                ${styl.background} 
                ${isAddingDocument == SelectionState.IS_CHOOSING_THE_MODE ||
                            isAddingDocument == SelectionState.NEW_POINT  ||
                            isAddingDocument == SelectionState.NEW_AREA
                            ? styl.expanded : ''}`}
                >
                    {/* Render selection mode options when choosing how to add a document */}
                    {isAddingDocument == SelectionState.IS_CHOOSING_THE_MODE && (
                        <div className={styl.verticalAlignment}>
                            <div style={{ height: '55px' }}>
                                <p>New Point {" "}
                                    <button className={styl.buttonLink} onClick={handleChooseNewPoint}>
                                        <FontAwesomeIcon icon={faCirclePlus} />
                                    </button>
                                </p>
                            </div>
                            <div style={{ height: '55px' }}>
                                <p>New Area {" "}
                                    <button className={styl.buttonLink} onClick={handleCreateNewArea}>
                                        <FontAwesomeIcon icon={faSquarePlus} />
                                    </button>
                                </p>
                            </div>
                            <div style={{ height: '55px' }}>
                                <p>Municipality {" "}
                                    <button className={styl.buttonLink} onClick={handleAssignToMunicipalArea}>
                                        <FontAwesomeIcon icon={faHouseChimney} />
                                    </button>
                                </p>
                            </div>
                            <div style={{ height: '55px' }}>
                                <p>Existing Point {" "}
                                    <button className={styl.buttonLink} onClick={handleSelectExistingPoint}>
                                        <FontAwesomeIcon icon={faMapMarker} />
                                    </button>
                                </p>
                            </div>
                            {/* Close button - always rendered */}
                            <div>
                                <p>
                                    Back {" "}
                            <CloseModeSelectionButton
                                isVisible={isAddingDocument != SelectionState.NOT_IN_PROGRESS}
                                onClick={() => { setIsAddingDocument(SelectionState.NOT_IN_PROGRESS) }}
                            />
                                </p>
                            </div>

                        </div>
                    )}
                    {isAddingDocument == SelectionState.NEW_AREA && (
                            <div className={styl.verticalAlignment}>
                                <div style={{ height: '55px' }}>
                                    <p>Confirm area {" "}
                                        <button className={styl.buttonLink} onClick={handleConfirmNewArea}>
                                            <FontAwesomeIcon icon={faCheck} />
                                        </button>
                                    </p>
                                </div>
                                <div>
                                <p>
                                    Back {" "}

                                <CloseModeSelectionButton
                                isVisible={isAddingDocument != SelectionState.NOT_IN_PROGRESS}
                                onClick={() => { setIsAddingDocument(SelectionState.NOT_IN_PROGRESS) }}
                            />
                                                            </p>
                            </div>


                            </div>
                    )}

                    {/* Display current mouse coordinates when adding a new point */}
                    {isAddingDocument == SelectionState.NEW_POINT && mouseCoords.lat && mouseCoords.lng && (
                        <>
                            Insert the point in ({mouseCoords.lat}, {mouseCoords.lng})
                            <div className={styles.spazio}></div>
                            <CloseModeSelectionButton
                                isVisible={isAddingDocument != SelectionState.NOT_IN_PROGRESS}
                                onClick={() => { setIsAddingDocument(SelectionState.NOT_IN_PROGRESS) }}
                            />
                        </>
                    )}

                    {/* Plus button - always rendered */}
                    {isAddingDocument != SelectionState.NOT_IN_PROGRESS &&
                        noXButton ? (
                            <button
                                className={styl.buttonLink}
                                onClick={() => {
                                    setIsAddingDocument(SelectionState.NOT_IN_PROGRESS);
                                    setToggleDrawing(false);
                                }}
                            >
                                <FontAwesomeIcon icon={faPlus}
                                    style={{
                                        transform: 'rotate(45deg)'
                                    }}
                                />
                            </button>
                        ) : null 
                    }   

                    {isAddingDocument == SelectionState.NOT_IN_PROGRESS &&(
                        <button
                            style={{ backgroundColor: 'transparent', color: 'white', border: 'none' }}
                            onClick={() => setIsAddingDocument(SelectionState.IS_CHOOSING_THE_MODE)}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                    )}
                </div>
            )}
        </>
    );
}

AddDocumentButton.propTypes = {
    isAddingDocument: PropTypes.string.isRequired, 
    setIsAddingDocument: PropTypes.func.isRequired, 
    kirunaPolygonCoordinates: PropTypes.array.isRequired, 
    setToggleDrawing: PropTypes.func, // Funzione per attivare o disattivare il disegno
    setConfirmSelectedArea: PropTypes.func // Funzione per confermare l'area selezionata
  };
  
export default AddDocumentButton;