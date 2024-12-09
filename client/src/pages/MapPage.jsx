import React, { useState, useRef } from 'react';
import { FaArrowsAltV } from 'react-icons/fa';
import MapComponent from '../components/Map';
import Diagram from "../components/Diagram";
import styles from './MapPage.module.css';

function MapPage() {
    const [diagramHeight, setDiagramHeight] = useState(300); // Initial height of the diagram
    const [dragging, setDragging] = useState(false); // State to track the dragging motion
    const containerRef = useRef(null); // Reference for the main container

    // Function to start the dragging action
    const startDrag = (e) => {
        setDragging(true);
        e.preventDefault(); // Prevent default behavior to avoid text selection or page scrolling
    };

    // Function to stop the dragging action
    const stopDrag = () => {
        setDragging(false);
    };

    // Function to handle the dragging motion and resize the diagram
    const handleDrag = (e) => {
        if (dragging) {
            // Calculate the new height based on the mouse position
            const newHeight = containerRef.current.offsetTop + containerRef.current.clientHeight - e.clientY;
            const maxHeight = window.innerHeight - containerRef.current.offsetTop; // Limit the height to the maximum window height

            // Set the new height if it falls within valid bounds
            if (newHeight > 100 && newHeight < maxHeight) { // No more arbitrary limits, only window height constraint
                setDiagramHeight(newHeight);
            }
        }
    };

    return (
        <div
            className={styles.mainContainer}
            ref={containerRef}
            onMouseMove={handleDrag} // Handle mouse movement for resizing
            onMouseUp={stopDrag} // Stop dragging when the mouse button is released
            onMouseLeave={stopDrag} // Stop dragging when the mouse leaves the container
        >
            <div className={styles.mapContainer}>
                <MapComponent />
            </div>

            {/* Resize bar to adjust diagram size */}
            <div
                className={styles.resizeBar}
                onMouseDown={startDrag} // Start dragging when the resize bar is clicked
            >
                <FaArrowsAltV className={styles.resizeIcon} /> {/* Icon indicating draggable area */}
            </div>

            <div className={styles.diagramContainer} style={{ height: diagramHeight }}>
                <Diagram />
            </div>
        </div>
    );
}

export default MapPage;
