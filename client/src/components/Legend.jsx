import React from 'react';
import { useContext } from "react";
import { DocumentContext } from '../contexts/DocumentContext'; 
import { AuthContext } from '../contexts/AuthContext';
import styles from './Legend.module.css'; 

const Legend = () => {
    const { documents, setMapMarkers } = useContext(DocumentContext); // Fetch documents from context
    const { loggedIn } = useContext(AuthContext);

    // Create a unique list of document types and associated icons
    const documentTypes = documents.reduce((acc, doc) => {
        const docType = doc.type || 'Unknown';
        if (!acc[docType]) {
            acc[docType] = doc.icon; // Store the icon associated with this type
        }
        return acc;
    }, {});

    // Filter documents by type
    const handleFilterByType = (docType) => {
        setMapMarkers((doc) => doc.type === docType); // Update markers based on filter
    };

    return (
        <>
          {documents.length > 0 && (
            <div className={styles.legendContainer}>
                <h4 className={styles.legendTitle}>Document Types</h4>
                <ul className={styles.legendList}>
                    {Object.entries(documentTypes).map(([docType, icon], index) => (
                        loggedIn ? (
                            <li 
                                key={docType} 
                                className={`${styles.legendItem} ${styles.clickable}`} 
                            >
                                <button 
                                    className={styles.legendButton} 
                                    onClick={() => handleFilterByType(docType)}
                                >
                                    <img src={icon} alt={docType} className={styles.legendIcon} />
                                    <span className={styles.legendText}>{docType}</span>
                                </button>
                            </li>
                        ) : (
                            <li 
                                key={docType} 
                                className={styles.legendItem}
                            >
                                <img src={icon} alt={docType} className={styles.legendIcon} />
                                <span className={styles.legendText}>{docType}</span>
                            </li>
                        )
                    ))}
                </ul>
            </div>
        )}

        </>
    );
};

export default Legend;
