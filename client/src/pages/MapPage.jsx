import React from 'react';
import MapComponent from '../components/Map';

function MapPage() {
    return (
        <div className="App" style={{ height: '91vh' }}>
            {/*<h1 style={{ textAlign: 'center',  marginBottom: '2rem' }}> Welcome to Kiruna</h1>*/}
            <MapComponent  />
        </div>
    );
}

export default MapPage;
