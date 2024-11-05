
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import API from '../services/api';

const NewLinkModal = ({ show, onClose, documentId, onAddConnection }) => {
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  // Fetch available documents that are not connected to the current document
  useEffect(() => {
    if (documentId) {
        var data = API.getAvailableDocuments(documentId);
        data.then((data) => {
            console.log(data);
            setAvailableDocuments(data);
        })
    }
  }, [documentId]);

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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="dark"
          onClick={() => onAddConnection(selectedDocumentId)}
          disabled={!selectedDocumentId}
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
  onAddConnection: PropTypes.func.isRequired
};

export default NewLinkModal;
