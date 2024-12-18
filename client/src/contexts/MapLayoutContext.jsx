import React, { createContext, useState, useContext, useMemo } from 'react';
import PropTypes from 'prop-types'; 

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


MapLayoutProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useMapLayoutContext() {
    return useContext(MapLayoutContext);
}
