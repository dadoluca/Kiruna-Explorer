import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Row, Col } from 'react-bootstrap';
import API from '../services/api';
import { FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaFileAlt, FaFileArchive } from "react-icons/fa";

const ResourcesModal = ({ show, onClose, documentId, documentTitle }) => {
    const [resources, setResources] = useState([]);

    const fileIcons = {
        pdf: <FaFilePdf style={{ color: "red" }} />,
        jpeg: <FaFileImage style={{ color: "blue" }} />,
        png: <FaFileImage style={{ color: "blue" }} />,
        docx: <FaFileWord style={{ color: "blue" }} />
    };

    const getFileExtension = (fileName) => {
        const parts = fileName.split(".");
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
    };
    
    useEffect(() => {
        if (show && documentId) {
        API.getResources(documentId).then((data) => {
            setResources(data.resources);
        });
        }
    }, [documentId, show]);

    const downloadBlob = (blob, filename, name) => {
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename; 

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }  

    const handleDownload = (filename, name) => {
        console.log('Download');
        API.downloadResource(documentId, filename).then((data) => {
            downloadBlob(data, name);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handleDownloadAll = () =>{
        console.log('Download All');
        resources.map((resource) => (
            handleDownload(resource.filename, resource.originalFilename)
        ));
    }

    return (
        <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
            <Modal.Title>{documentTitle} resources <Button variant="dark" onClick={()=>handleDownloadAll()}>Download All <i className="bi bi-download"></i></Button></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {/* List of Resources for the document */}
            {resources.map((resource, index) => (
                <div className={index} key={resource._id}>
                    <Row>
                        <Col md={7}>
                            {fileIcons[getFileExtension(resource.originalFilename)] || <FaFileAlt style={{ color: "black" }} />}
                            <p>{resource.originalFilename}</p>
                        </Col>
                        <Col md={3}>
                            <Button variant="dark" onClick={()=>handleDownload(resource.filename, resource.originalFilename)}><i className="bi bi-download"></i></Button>
                        </Col>
                    </Row>
                </div>
            ))}
        </Modal.Body>
        </Modal>
    );
}

ResourcesModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    documentId: PropTypes.string.isRequired,
    documentTitle: PropTypes.string.isRequired,
};

export default ResourcesModal;