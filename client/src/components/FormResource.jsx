import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import PropTypes from "prop-types";
import Form from 'react-bootstrap/Form';
import { Button, Row, Col, Card } from 'react-bootstrap';
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './FormDocument.module.css';
import API from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ResourceForm(props){
    const navigate = useNavigate();
    const documentId = props.id;

    const [files, setFiles] = useState([]);
    
    const handleFileChange = (event) => {
      const selectedFiles = event.target.files;
      setFiles(selectedFiles);
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      try {
        //Upload resources
        await API.addResources(documentId, files);

        // Reset form fields after submission
        toast.success("Resources added successfully!");
        navigate('/map');
      } catch (error) {
        console.error("Failed to add resources to the document:", error);
        toast.error("Failed to add resources to the document!");
      }

      console.log(files);
    };
  
    return (
        <Card className={styles.formCard}>
        <Card.Title className={styles.title}><i className="bi bi-file-earmark-medical-fill"></i>Add resources</Card.Title>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formFileMultiple" className="mb-3">
                    <Form.Label>Add resources</Form.Label>
                    <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    />
                </Form.Group>
                <Row className="mt-3">
                        <Col>
                            <Button 
                                variant="light" 
                                onClick={()=>navigate('/map')}  
                                className='btn btn-light w-100 border-dark'
                            >
                                Back
                            </Button>
                        </Col>
                        <Col>
                            <Button 
                                variant="dark" 
                                onClick={handleSubmit} 
                                className="w-100"
                            >
                                Add
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
      </Card>
    );
};

ResourceForm.propTypes = {
    id: PropTypes.string
};

export default ResourceForm;