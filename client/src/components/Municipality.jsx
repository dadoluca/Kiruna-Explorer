import React from 'react';
import PropTypes from 'prop-types';  // Import PropTypes
import { useContext } from "react";
import { DocumentContext } from '../contexts/DocumentContext'; 
import { AuthContext } from '../contexts/AuthContext';
import styles from './Municipality.module.css'; 

const Municipality = ({ isListing, onClick }) => {
    const handleClick = () => {
        onClick();
    };

    return (
        <div 
            className={`${styles.buttonContainer} ${isListing ? styles.isListing : ''}`}
        >
            <button 
                className={styles.btnStyle} 
                onClick={handleClick}
            >
                <img 
                    src="/municipality.png" 
                    alt="Municipality" 
                    className={styles.municipalityIcon} 
                />
                Municipality Documents
            </button>
        </div>
    );
};

// Prop validation
Municipality.propTypes = {
    isListing: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default Municipality;
