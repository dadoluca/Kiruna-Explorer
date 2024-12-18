import React, { createContext, useState, useContext, useMemo } from 'react';

const MapLayoutContext = createContext();

export function MapLayoutProvider({ children }) {
    const [isMapHigh, setIsMapHigh] = useState(true);

    const value = useMemo(() => ({ isMapHigh, setIsMapHigh }), [isMapHigh]);

    return (
        <MapLayoutContext.Provider value={value}>
            {children}
        </MapLayoutContext.Provider>
    );
}

export function useMapLayoutContext() {
    return useContext(MapLayoutContext);
}
