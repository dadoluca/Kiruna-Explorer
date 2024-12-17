import React from 'react';

const DiagramButtons = () => {
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
      <button
        style={buttonLinkStyle}
        onMouseEnter={(e) => {
          Object.assign(e.target.style, buttonHoverStyle);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, buttonLinkStyle);
        }}
      >
        B1
      </button>
      <button
        style={buttonLinkStyle}
        onMouseEnter={(e) => {
          Object.assign(e.target.style, buttonHoverStyle);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, buttonLinkStyle);
        }}
      >
        B2
      </button>
    </div>
  );
};

export default DiagramButtons;
