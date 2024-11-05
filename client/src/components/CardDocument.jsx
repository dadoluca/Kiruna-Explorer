import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import PropTypes from "prop-types";
import { FaUser, FaCalendarAlt, FaMapMarkerAlt, FaFileAlt, FaLanguage, FaBook, FaProjectDiagram, FaPlus } from 'react-icons/fa';
import NewLinkModal from './NewLinkModal';

import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './CardDocument.module.css';

const DetailPlanCard = (props) => {
  const document = props.doc || {};
  const [showModal, setShowModal] = useState(false);


  const handleAddConnection = async () => {
    // Logic to add connection here
    try {
      const response = await fetch(`/api/documents/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromDocumentId: document._id,
          toDocumentId: selectedDocumentId,
          type: "direct consequence", // Default or chosen type
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert("Connection added successfully!");
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error adding connection:", error);
    }
  };

  return (
    <Card className={styles.detailPlanCard}>
      <Card.Body>
        <Card.Title className={`text-center ${styles.cardTitle}`}>
          {document.title || "N/A"}
        </Card.Title>

        <Card.Text className={styles.description}>
          <strong>Description: </strong> {document.description || "N/A"}
        </Card.Text>

        <ListGroup variant="flush">
          <ListGroup.Item className={styles.listItem}>
            <FaUser className={styles.icon} />
            <strong> Stakeholders:</strong> {document.stakeholders?.length > 0 ? (
              document.stakeholders.map((item, index) => (
                <div key={index} className={styles.stakeholderItem}>{item}</div>
              ))
            ) : "N/A"}
          </ListGroup.Item>
          
          <ListGroup.Item className={styles.listItem}>
            <FaMapMarkerAlt className={styles.icon} />
            <strong> Scale: </strong> {document.scale || "N/A"}
          </ListGroup.Item>

          <ListGroup.Item className={styles.listItem}>
            <FaCalendarAlt className={styles.icon} />
            <strong> Issuance date: </strong> {document.issuance_date || "N/A"}
          </ListGroup.Item>

          <ListGroup.Item className={styles.listItem}>
            <FaFileAlt className={styles.icon} />
            <strong> Type: </strong> {document.type || "N/A"}
          </ListGroup.Item>

          {/* Connections number,  dropdown to show related documents, add connection btn */}
          <ListGroup.Item className={styles.listItem}>
            <FaProjectDiagram className={styles.icon} />
            
            <strong> Connections: </strong> 
            <span className={styles.connectionCount}>{document.connections || "N/A"}</span>

            {/* dropdown to show related documents*/}
            <Dropdown className={`${styles.dropdownButton}`}>
              <Dropdown.Toggle variant="link" className={styles.dropdownToggle}>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {document.relationships && document.relationships.length > 0 ? (
                  document.relationships.map((rel, index) => (
                    <Dropdown.Item key={index}>
                      {rel.documentTitle} - {rel.type}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item>No related documents</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>

          {/*add connection btn */}
          <FaPlus
              className={`${styles.addConnectionIcon}`}
              onClick={() => setShowModal(true)}
            />
          </ListGroup.Item>



          <ListGroup.Item className={styles.listItem}>
            <FaLanguage className={styles.icon} />
            <strong> Language: </strong> {document.language || "N/A"}
          </ListGroup.Item>

          <ListGroup.Item className={styles.listItem}>
            <FaBook className={styles.icon} />
            <strong> Pages: </strong> {document.pages || "N/A"}
          </ListGroup.Item>
        </ListGroup>

        {/* Modal to select a new document to connect */}
        <NewLinkModal
          show={showModal}
          onClose={() => setShowModal(false)}
          documentId={document._id}
          onAddConnection={handleAddConnection}
        />
      </Card.Body>
    </Card>
  );
};

DetailPlanCard.propTypes = {
  doc: PropTypes.object,
  onClose: PropTypes.func
};

export default DetailPlanCard;
