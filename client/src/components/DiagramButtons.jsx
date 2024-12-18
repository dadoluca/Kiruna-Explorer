import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DiagramButtons = ({ isDragging, setIsDragging, savePositions }) => {
  const [hovered, setHovered] = useState(false);

  const buttonLinkStyle = {
    backgroundColor: '#333333', // Grigio scuro
    color: '#ffffff', // Testo bianco
    border: 'none',
    borderRadius: '50%', // Forma circolare
    width: '3rem',
    height: '3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontFamily: "'Source Code Pro', monospace",
    fontSize: '1rem',
    margin: '5px 0',
    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.3)',
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  };

  const containerStyle = {
    position: 'absolute',
    bottom: '10px',
    right: '15px',
    display: 'flex',
    flexDirection: 'column', // Allinea verticalmente
    alignItems: 'flex-end',
  };

  const buttonHoverStyle = {
    backgroundColor: '#666666', // Grigio più chiaro al passaggio del mouse
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.4)',
  };

  return (
    <div style={containerStyle}>
      {isDragging && (
        <button
          style={{ ...buttonLinkStyle, ...(hovered && buttonHoverStyle) }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => {
            savePositions();
          }}
        >
          <i className="bi bi-save" style={{ fontSize: '1.2rem' }}></i> {/* Icona Save */}
          </button>
      )}
        <button
          style={{ ...buttonLinkStyle, ...(hovered && buttonHoverStyle) }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => {
            if(!isDragging)
              toast.info("Now you can start moving the documents.");
            else
              toast.info("Now you can't move the documents anymore.");

            setIsDragging((prev) => !prev);
          }}
        >
          <i className="bi bi-arrows-move" style={{ fontSize: '1.2rem' }}></i> {/* Icona Drag */}
        </button>
    </div>
  );
};

DiagramButtons.propTypes = {
  isDragging: PropTypes.bool.isRequired,
  setIsDragging: PropTypes.func.isRequired,
  savePositions: PropTypes.func.isRequired
};

export default DiagramButtons;
