import React from 'react';
import MapComponent from '../components/Map';
import Diagram from "../components/Diagram";
import styles from './MapPage.module.css';

function MapPage() {
    return (
        <div className="App" style={{ height: '91vh' }}>
            {/*<h1 style={{ textAlign: 'center',  marginBottom: '2rem' }}> Welcome to Kiruna</h1>*/}
            <MapComponent  />
            <div className={styles.diagramContainer}>
                <Diagram />
            </div>
        </div>
    );
}

export default MapPage;
