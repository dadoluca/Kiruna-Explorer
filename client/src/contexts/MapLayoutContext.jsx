import React, { createContext, useState, useContext } from 'react';

const MapLayoutContext = createContext();

export function MapLayoutProvider({ children }) {
    const [isMapHigh, setIsMapHigh] = useState(true);

    return (
        <MapLayoutContext.Provider value={{ isMapHigh, setIsMapHigh }}>
            {children}
        </MapLayoutContext.Provider>
    );
}


export function useMapLayoutContext() {
    return useContext(MapLayoutContext);
}
