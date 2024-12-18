import React from 'react';
import PropTypes from 'prop-types';

const DiagramButtons = ({ showButton, toggleNodesDrag, savePositions }) => {
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
      {showButton && (
        <button
          style={buttonLinkStyle}
          onMouseEnter={(e) => {
            Object.assign(e.target.style, buttonHoverStyle);
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, buttonLinkStyle);
          }}
          onClick={savePositions}
        >
          <i className="bi bi-save" style={{ fontSize: '1.2rem' }}></i> {/* Icona Save */}
          </button>
      )}
        <button
        style={buttonLinkStyle}
        onMouseEnter={(e) => {
          Object.assign(e.target.style, buttonHoverStyle);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, buttonLinkStyle);
        }}
        onClick={toggleNodesDrag}
      >
        <i className="bi bi-arrows-move" style={{ fontSize: '1.2rem' }}></i> {/* Icona Drag */}
        </button>
    </div>
  );
};

DiagramButtons.propTypes = {
  toggleNodesDrag: PropTypes.func.isRequired,
  savePositions: PropTypes.func.isRequired
};

export default DiagramButtons;
