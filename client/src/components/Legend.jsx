import React from 'react';
import styles from './Legend.module.css'; // New styles for Legend

const Legend = ({ markers }) => {
    // Create a unique list of document types and associated icons
    const documentTypes = markers.reduce((acc, marker) => {
        const docType = marker.type || 'Unknown';
        if (!acc[docType]) {
            acc[docType] = marker.icon; // Store the icon associated with this type
        }
        return acc;
    }, {});

    return (
        <>
        {markers.length > 0 && <div className={styles.legendContainer}>
            <h4 className={styles.legendTitle}>Document Types</h4>
            <ul className={styles.legendList}>
                {Object.entries(documentTypes).map(([docType, icon], index) => (
                    <li key={index} className={styles.legendItem}>
                        <img src={icon} alt={docType} className={styles.legendIcon} />
                        <span className={styles.legendText}>{docType}</span>
                    </li>
                ))}
            </ul>
        </div>}</>
    );
};

export default Legend;
