import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const CloseModeSelectionButton= ({ onClick }) => {
    return (
        <button
            style={{ height: '100%',  backgroundColor: 'transparent', color: 'white', border: 'none' }}
            onClick={onClick}
        >
            <FontAwesomeIcon icon={faTimes} />
        </button>
    );
};

export default CloseModeSelectionButton;
