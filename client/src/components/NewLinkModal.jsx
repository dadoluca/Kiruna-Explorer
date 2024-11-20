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
  const [connections, setConnections] = useState([{ selectedDocumentId: '', selectedType: '' }]);

  useEffect(() => {
    if (show && documentId) {
      API.getAvailableDocuments(documentId).then((data) => {
        setAvailableDocuments(data);
      });
    }
  }, [documentId, show]);

  const handleAddConnection = () => {
    setConnections(prev => [
      ...prev,
      {
        selectedDocumentId: '',
        selectedType: '',
      }
    ]);
  };

  const handleChange = (index, field, value) => {
    const newConnections = [...connections];
    newConnections[index][field] = value;

    setConnections(newConnections);
  };

  const handleRemoveConnection = (index) => {
    const newConnections = [...connections];
    newConnections.splice(index, 1);

    setConnections(newConnections);
  };

  const handleSaveConnections = async () => {
    try {
      for (const connection of connections) {
        const selectedDocument = availableDocuments.find(doc => doc._id === connection.selectedDocumentId);
        const selectedTitle = selectedDocument ? selectedDocument.title : '';

        const result1 = await API.createConnection({
          documentId,
          newDocumentId: connection.selectedDocumentId,
          type: connection.selectedType,
          title: selectedTitle,
        });
        updateDocument(result1);
        
        const result2 = await API.createConnection({
          documentId: connection.selectedDocumentId,
          newDocumentId: documentId,
          type: connection.selectedType,
          title: documentTitle,
        });
        updateDocument(result2);
      }

      onAddConnection();
      setConnections([{ selectedDocumentId: '', selectedType: '' }]);
    } catch (error) {
      console.error("Error creating connections:", error);
    }
  };

  const getAvailableOptions = (index) => {
    const selectedDocumentIds = connections.map(conn => conn.selectedDocumentId);
    return availableDocuments.filter(doc => !selectedDocumentIds.includes(doc._id));
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Connections</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {connections.map((connection, index) => (
          <div key={index} className="mb-3">
            <Form.Group controlId={`formDocumentSelect-${index}`} className="mb-3">
              <Form.Label>Select Document</Form.Label>
              <Form.Control
                as="select"
                value={connection.selectedDocumentId || ''}
                onChange={(e) => handleChange(index, 'selectedDocumentId', e.target.value)}
              >
                <option value="">Choose...</option>
                {getAvailableOptions(index).map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.title}
                  </option>
                ))}
                {/* Display selected document title within the select field */}
                {connection.selectedDocumentId && (
                  <option value={connection.selectedDocumentId}>
                    {availableDocuments.find(doc => doc._id === connection.selectedDocumentId)?.title}
                  </option>
                )}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId={`formConnectionType-${index}`} className="mb-3">
              <Form.Label>Select Connection Type</Form.Label>
              <Form.Control
                as="select"
                value={connection.selectedType || ''}
                onChange={(e) => handleChange(index, 'selectedType', e.target.value)}
              >
                <option value="">Choose...</option>
                {connectionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Button
              variant="light"
              onClick={() => handleRemoveConnection(index)}
              size="sm"
              className="mb-3"
            >
              Remove Connection
            </Button>
          </div>
        ))}
        
        <Button
          variant="light"
          onClick={handleAddConnection}
          size="sm"
        >
          Add Another Connection
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="dark"
          onClick={handleSaveConnections}
          disabled={connections.some(conn => !conn.selectedDocumentId || !conn.selectedType) || connections.length === 0}
        >
          Save Connections
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

NewLinkModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  documentId: PropTypes.string.isRequired,
  documentTitle: PropTypes.string.isRequired,
  onAddConnection: PropTypes.func.isRequired,
};

export default NewLinkModal;
