import React, { useState, useRef } from 'react';
import { FaArrowsAltV } from 'react-icons/fa';
import MapComponent from '../components/Map';
import Diagram from "../components/Diagram";
import { MapLayoutProvider, useMapLayoutContext } from '../contexts/MapLayoutContext';
import styles from './MapPage.module.css';

function MapPage() {
    const [diagramHeight, setDiagramHeight] = useState(300);
    const [dragging, setDragging] = useState(false);
    const containerRef = useRef(null);
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

            <div
                className={styles.resizeBar}
                onMouseDown={startDrag}
                tabIndex="0"
                role="button"
            >
                <FaArrowsAltV className={styles.resizeIcon} />
            </div>

            <div className={styles.diagramContainer} style={{ height: diagramHeight }}>
                <Diagram />
            </div>
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
