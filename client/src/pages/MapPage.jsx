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
            const newHeight = containerRef.current.offsetTop + containerRef.current.clientHeight - e.clientY;
            const maxHeight = window.innerHeight - containerRef.current.offsetTop; 

            if (newHeight > 0 && newHeight < maxHeight) {
                setDiagramHeight(newHeight);
            }
        }
    };

    return (
        <div
            className={styles.mainContainer}
            ref={containerRef}
            onMouseMove={handleDrag}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
        >
            <div className={styles.mapContainer}>
                <MapComponent />
            </div>

            <div
                className={styles.resizeBar}
                onMouseDown={startDrag}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") startDrag(e);
                }}
            >
                <FaArrowsAltV className={styles.resizeIcon} />
            </div>

            <div className={styles.diagramContainer} style={{ height: diagramHeight }}>
                <Diagram />
            </div>
        </div>
    );
}

export default MapPage;
