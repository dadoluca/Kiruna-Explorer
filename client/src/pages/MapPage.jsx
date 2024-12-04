import React, { useState } from 'react';
import MapComponent from '../components/Map';
import Diagram from "../components/Diagram";
import styles from './MapPage.module.css';

function MapPage() {
    const [isDiagramOpen, setIsDiagramOpen] = useState(false);

    const toggleDiagram = () => {
        setIsDiagramOpen(!isDiagramOpen);
    };

    return (
        <div className="App">
            <div className={styles.mainContainer}>
                {/*<h1 style={{ textAlign: 'center',  marginBottom: '2rem' }}> Welcome to Kiruna</h1>*/}
                <MapComponent isDiagramOpen={isDiagramOpen} />
                <Diagram isDiagramOpen={isDiagramOpen} setIsDiagramOpen={toggleDiagram}/>
            </div>
        </div>
    );
}

export default MapPage;
