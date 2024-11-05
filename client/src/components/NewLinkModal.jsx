import React, { useState, useEffect } from 'react';
import { useDocumentContext } from '../contexts/DocumentContext';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import API from '../services/api';

const connectionTypes = ['direct consequence', 'collateral consequence', 'projection', 'update'];

const NewLinkModal = ({ show, onClose, documentId, documentTitle, onAddConnection }) => {
  const { updateDocument } = useDocumentContext();
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    if (documentId) {
      API.getAvailableDocuments(documentId).then((data) => {
        console.log(data);
        setAvailableDocuments(data);
      });
    }
  }, [documentId]);

  const handleAddConnection = async () => {
    const selectedDocument = availableDocuments.find(doc => doc._id === selectedDocumentId);
    const selectedTitle = selectedDocument ? selectedDocument.title : '';
    
    try {
      const result1 = await API.createConnection({
        documentId,
        newDocumentId: selectedDocumentId,
        type: selectedType,
        title: selectedTitle,
      });
  
      updateDocument(result1);
      console.log(result1);
  
      const result2 = await API.createConnection({
        documentId: selectedDocumentId,
        newDocumentId: documentId,
        type: selectedType,
        title: documentTitle,
      });
  
      updateDocument(result2);
      console.log(result2);
  
      onAddConnection();
    } catch (error) {
      console.error("Error creating connections:", error);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Connection</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="formDocumentSelect">
          <Form.Label>Select Document</Form.Label>
          <Form.Control
            as="select"
            value={selectedDocumentId}
            onChange={(e) => setSelectedDocumentId(e.target.value)}
          >
            <option value="">Choose...</option>
            {availableDocuments.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.title}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="formConnectionType">
          <Form.Label>Select Connection Type</Form.Label>
          <Form.Control
            as="select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Choose...</option>
            {connectionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="dark"
          onClick={handleAddConnection}
          disabled={!selectedDocumentId || !selectedType}
        >
          Add Connection
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

NewLinkModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  documentId: PropTypes.string.isRequired,
  onAddConnection: PropTypes.func.isRequired,
};

export default NewLinkModal;
