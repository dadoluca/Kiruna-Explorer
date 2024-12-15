import React, { useState, useRef, useContext } from 'react';
import { FaArrowsAltV } from 'react-icons/fa';
import MapComponent from '../components/Map';
import Diagram from "../components/Diagram";
import { MapLayoutProvider, useMapLayoutContext } from '../contexts/MapLayoutContext';
import styles from './MapPage.module.css';
import { DocumentContext } from '../contexts/DocumentContext';

function MapPage() {
    const [diagramHeight, setDiagramHeight] = useState(300); // Initial height of the diagram
    const { visualizeDiagram } = useContext(DocumentContext);
    const [dragging, setDragging] = useState(false); // State to track the dragging motion
    const containerRef = useRef(null); // Reference for the main container
    const maxHeight = window.innerHeight * 0.91;
    const minHeight = 0;
    const { setIsMapHigh } = useMapLayoutContext();


    const startDrag = (e) => {
        setDragging(true);
        e.preventDefault();
    };

    const stopDrag = () => setDragging(false);

    const handleDrag = (e) => {
        if (dragging) {
            const newHeight = containerRef.current.offsetTop + containerRef.current.clientHeight - e.clientY;
            const maxHeight = window.innerHeight - containerRef.current.offsetTop;

            if (newHeight > 0 && newHeight < maxHeight) {
                setDiagramHeight(newHeight);

                setIsMapHigh(newHeight < 270); 
            }
        }
    };

    // Close with one click
    const handleClick = () => {
        setDiagramHeight(minHeight);
    };

    // Open with double click
    const handleDoubleClick = () => {
        setDiagramHeight(maxHeight);
    };

    return (
        <div
            className={styles.mainContainer}
            ref={containerRef}
            onMouseMove={handleDrag}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            tabIndex="0"
            role="button"
        >
            <div className={styles.mapContainer}>
                <MapComponent />
            </div>


            { visualizeDiagram &&
            <div className="diagramComponents">
                {/* Resize bar to adjust diagram size */}
                <div
                    className={styles.resizeBar}
                    onMouseDown={startDrag} // Start dragging when the resize bar is clicked
                    onClick={handleClick} // Close the diagram
                    onDoubleClick={handleDoubleClick} // Open the diagram
                    tabIndex="0"
                    role="button"
                >
                    <FaArrowsAltV className={styles.resizeIcon} /> {/* Icon indicating draggable area */}
                </div>

                <div className={styles.diagramContainer} style={{ height: diagramHeight }}>
                    <Diagram />
                </div>
            </div>}
        </div>
    );
}

export default function App() {
    return (
        <MapLayoutProvider>
            <MapPage />
        </MapLayoutProvider>
    );
}
