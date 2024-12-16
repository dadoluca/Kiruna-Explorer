import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styl from './addDocumentButton.module.css';

const CloseModeSelectionButton = ({ onClick }) => {
    return (
        <div>
            <p>
                Back {" "}
                <button
                className={styl.buttonLink}
                    onClick={onClick}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </p>
        </div>
    );
};

// Add PropTypes validation
CloseModeSelectionButton.propTypes = {
    onClick: PropTypes.func.isRequired, // Ensure onClick is a required function
};

export default CloseModeSelectionButton;
