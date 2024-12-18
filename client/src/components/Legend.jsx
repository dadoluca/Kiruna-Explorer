import React, { useContext, useState } from 'react';
import { DocumentContext } from '../contexts/DocumentContext'; 
import { AuthContext } from '../contexts/AuthContext';
import PropTypes from 'prop-types';
import styles from './Legend.module.css'; 

const Legend = ({ isListing }) => {
    const { documents, setMapMarkers } = useContext(DocumentContext);
    const { loggedIn } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    
    const documentTypes = documents.reduce((acc, doc) => {
        const docType = doc.type || 'Unknown';
        if (!acc[docType]) {
            acc[docType] = doc.icon;
        }
        return acc;
    }, {});

    // Filter documents by type
    const handleFilterByType = (docType) => {
        setMapMarkers((doc) => doc.type === docType); 
        setIsOpen(false);
    };

    const handleClearFilters = () => {
        setMapMarkers(() => documents); 
        setIsOpen(false);
    };

    return (
        <>
        {documents.length > 0 && (
            <div 
                className={`${styles.legendContainer} ${isListing ? styles.isListing : ''}`}
            >
                <button 
                    className={styles.dropdownToggle} 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <img src="/filter-icon.png" alt="Legend" className={styles.legendIcon} />
                    Document Types
                    <img src="/dropdown.png" alt="Dropdown" className={styles.dropdownIcon} />
                </button>

                {isOpen && (
                    <>
                        <ul className={styles.legendList}>
                            {Object.entries(documentTypes).map(([docType, icon], index) => (
                                <li 
                                    key={index} 
                                    className={`${styles.legendItem} ${loggedIn ? styles.clickable : ''}`} 
                                    onClick={() => {
                                        if (loggedIn) {
                                            handleFilterByType(docType);
                                        }
                                    }} 
                                >
                                    <img src={icon} alt={docType} className={styles.legendIcon} />
                                    <span className={styles.legendText}>{docType}</span>
                                </li>
                            ))}
                            {
                                loggedIn && <li className={styles.separator}></li>
                            }                            
                        </ul>
                        {
                            loggedIn && (
                                <button 
                                    className={`${styles.legendItem} ${styles.visualizeAll} ${styles.clickable}`} 
                                    onClick={handleClearFilters}
                                >
                                    <img 
                                        src="/all.png" 
                                        alt="Show All" 
                                        className={styles.visualizeAllIcon} 
                                    />
                                    <span className={styles.legendText}>Visualize All</span>
                                </button>
                            )
                        }
                    </>
                )}
            </div>
        )}
        </>
    );
};


Legend.propTypes = {
    isListing: PropTypes.bool.isRequired,
};

export default Legend;
