import React from 'react';
import MapComponent from '../components/Map';

function HomePage() {
    return (
        <div className="App">
            {/*<h1 style={{ textAlign: 'center',  marginBottom: '2rem' }}> Welcome to Kiruna</h1>*/}
            <MapComponent  />
        </div>
    );
}

export default HomePage;
