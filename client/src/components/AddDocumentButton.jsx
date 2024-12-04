import React, { useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapEvents} from 'react-leaflet';
import { AuthContext } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import styles from './Map.module.css';
import { SelectionState } from './SelectionState'; 
import  CloseModeSelectionButton  from './CloseModeSelectionButton';
import PropTypes from 'prop-types';


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
                        lat: parseFloat(e.latlng.lat.toFixed(5)), 
                        lng: parseFloat(e.latlng.lng.toFixed(5)) 
                    };
                    
                    setMouseCoords(newCoords);
                }
            },
            click: (e) => {
                try {
                    // Navigate to document creation if in selection mode
                    if (isAddingDocument === SelectionState.NEW_POINT && loggedIn && changingDocument === null) {
                        const isInAnyPolygon = kirunaPolygonCoordinates.some((polygon) => 
                            isPointInPolygon(mouseCoords, polygon)
                        );
            
                        if (isInAnyPolygon) {
                            console.log('Coordinates within polygon:', e.latlng);
                            navigate('/document-creation', { state: { coordinates: e.latlng } });
                            setIsAddingDocument(SelectionState.NOT_IN_PROGRESS);
                            return;
                        } else {
                            console.warn('Point is not within any polygon.');
                        }
                    }
            
                    // Update coordinates of an existing document
                    if (changingDocument) {
                        const { lat, lng } = e.latlng;
            
                        // Prepare updated coordinates
                        const updatedCoordinates = {
                            type: changingDocument.coordinates.type,
                            coordinates: [lng, lat], // GeoJSON format: [lng, lat]
                        };
            
                        // Update the coordinates on the server
                        try {
                            API.updateDocumentCoordinates(
                                changingDocument._id,
                                updatedCoordinates.type,
                                updatedCoordinates.coordinates
                            )
                                .then(() => {
                                    console.log('Coordinates successfully updated.');
                                    updateDocCoords(changingDocument._id, updatedCoordinates.coordinates);
                                    setMapMarkers();
                                })
                                .catch((err) => {
                                    console.error('Error updating coordinates:', err.message);
                                });
                        } catch (serverError) {
                            console.error('Unexpected server error while updating coordinates:', serverError.message);
                        }
            
                        // Reset mode
                        setChangingDocument(null);
                        setIsAddingDocument(SelectionState.NOT_IN_PROGRESS);
                    }
                } catch (error) {
                    console.error('Unexpected error in click handler:', error.message);
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
            ${isAddingDocument === SelectionState.IS_CHOOSING_THE_MODE ||
                isAddingDocument === SelectionState.NEW_POINT
                ? styles.expanded : ''}`}
        role="button"
        tabIndex={0} // Makes the div focusable
        onClick={() => setIsAddingDocument(SelectionState.IS_CHOOSING_THE_MODE)} // Handle click events
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                setIsAddingDocument(SelectionState.IS_CHOOSING_THE_MODE);
            }
        }} // Handle keyboard events like Enter and Space
    >
        {isAddingDocument === SelectionState.IS_CHOOSING_THE_MODE && (
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
        )}

        {isAddingDocument === SelectionState.NEW_POINT && mouseCoords.lat && mouseCoords.lng && (
            <div>
                Insert the point in ({mouseCoords.lat}, {mouseCoords.lng})
                <div className={styles.spazio}></div>
            </div>
        )}

        {isAddingDocument !== SelectionState.NOT_IN_PROGRESS ? (
            <CloseModeSelectionButton
                onClick={() => setIsAddingDocument(SelectionState.NOT_IN_PROGRESS)}
            />
        ) : (
            <FontAwesomeIcon icon={faPlus} />
        )}
    </div>
)}

        </>
    );
}

AddDocumentButton.propTypes = {
    isAddingDocument: PropTypes.string.isRequired, // Expected to match the values of SelectionState
    setIsAddingDocument: PropTypes.func.isRequired, // A function to update the state
    kirunaPolygonCoordinates: PropTypes.arrayOf(
        PropTypes.arrayOf(
            PropTypes.arrayOf(PropTypes.number)
        )
    ).isRequired, // Array of polygons, each polygon is an array of coordinates
};

export default AddDocumentButton;