import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import style from './AddDocumentButton.module.css';

const CloseModeSelectionButton = ({ onClick }) => {
    return (
                <button
                className={style.buttonLink}
                    onClick={onClick}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
    );
};

// Add PropTypes validation
CloseModeSelectionButton.propTypes = {
    onClick: PropTypes.func.isRequired, // Ensure onClick is a required function
};

export default CloseModeSelectionButton;
