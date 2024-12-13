import React, { useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from './ListDocument.module.css';
import Button from 'react-bootstrap/Button';
import SearchBar from './SearchBar';
import PropTypes from "prop-types";
import { Row, Col } from 'react-bootstrap';
import { DocumentContext } from '../contexts/DocumentContext';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import 'bootstrap-icons/font/bootstrap-icons.css';

const ScrollableDocumentsList = (props) => {
  const { loggedIn } = useContext(AuthContext);
  const { docList } = useContext(DocumentContext); // Fetch documents from context
  const navigate = useNavigate();

  const handleFilter = (title) => {
    console.log(title);
    props.handleFilterByTitleInList(title);
  };

  const handleCardClick = (doc) => {
    props.visualizeCard(doc); // Call the visualize function
  };

  return (
    <div className={styles.container}>
      {/* Fixed header (not scrollable) */}
      <div className={styles.header}>
        <Row className={styles.headerRow}>
          <Col md={10}>
            {loggedIn && <SearchBar onFilter={handleFilter} visualizeCard={props.visualizeCard}/>}
          </Col>
          <Col md={2} className={styles.closeButtonContainer}>
          <button
            className={styles.closeButton}
            onClick={() => props.closeList()}
            aria-label="Close"
            >
              &times;
          </button>
          </Col>
        </Row>
      </div>

      <div className={styles.scrollableCardList}>
        {docList.map((doc) => (
          <div
            key={doc._id}
            className={styles.cardWrapper}
            role="button" // Add semantic role
            tabIndex={0} // Make the div focusable
            onClick={() => handleCardClick(doc)} // Use the new function
            onKeyDown={(e) => { // Handle keyboard interaction
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick(doc); // Use the new function
              }
            }}
          >
            <div className={styles.cardContent}>
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>{doc.title}</div>
                <Row className={styles.rowStyle}>
                  <Col md={3} className={styles.rowStyleCol}>
                    {doc.issuance_date}
                  </Col>
                  <Col md={4} className={styles.rowStyleCol}>
                    {doc.stakeholders}
                  </Col>
                  <Col md={3} className={styles.rowStyleCol}>
                    {doc.language}
                  </Col>
                </Row>
                <Row>
                  <Col md={9}>
                    <div className={styles.cardText}>{doc.description}</div>
                  </Col>
                  <Col md={2}>
                    <img
                      src={doc.icon}
                      alt="Icon"
                      className={styles.cardIcon}
                    />
                  </Col>
                </Row>
              </div>
            </div>
            <div className={styles.separator}></div> {/* Separator */}
          </div>
        ))}
      </div>

      {props.addButton !== null && (
        <button
          className={styles.addButton}
          onClick={() => {
            navigate('/document-creation', {
              state: { customArea: props.addButton }
            });
            props.closeList(); // Close the list when navigating
          }}
        >
          <i className="bi bi-plus"></i>
        </button>
      )}
    </div>
  );
};

ScrollableDocumentsList.propTypes = {
  markers: PropTypes.array,
  visualizeCard: PropTypes.func,
  closeList: PropTypes.func,
  handleFilterByTitleInList: PropTypes.func, // Ensure this prop is defined
  addButton: PropTypes.any, // Specify the expected type for addButton
};

export default ScrollableDocumentsList;
