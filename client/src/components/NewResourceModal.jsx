import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import ResourceForm from './FormResource';
import API from '../services/api';

const NewResourceModal = ({ show, onClose, documentId, documentTitle }) => {
    const [resources, setResources] = useState([]);
    
    useEffect(() => {
        if (show && documentId) {
        API.getResources(documentId).then((data) => {
            setResources(data);
        });
        }
    }, [documentId, show]);
    
    return (
        <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
            <Modal.Title>{documentTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <ResourceForm id={documentId} />
        </Modal.Body>
        </Modal>
    );
    };

NewResourceModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    documentId: PropTypes.string.isRequired,
    documentTitle: PropTypes.string.isRequired,
};

export default NewResourceModal;