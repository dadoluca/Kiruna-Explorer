import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { Button, Row, Col, Card } from 'react-bootstrap';
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './FormDocument.module.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


function ResourceForm(){
    const navigate = useNavigate();

    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    
    const handleFileChange = (event) => {
      const selectedFiles = event.target.files;
      setFiles(selectedFiles);
    };
  
    const handleSubmit = (event) => {
      event.preventDefault();
  
      if (files.length === 0) {
        setError('Per favore, allega almeno un documento.');
        return;
      }

      console.log(files);
      setError('');
      alert('');
    };
  
    return (
        <Card className={styles.formCard}>
        <Card.Title className={styles.title}><i class="bi bi-file-earmark-medical-fill"></i>Add resources</Card.Title>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formFileMultiple" className="mb-3">
                    <Form.Label>Select resources</Form.Label>
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
                                onClick={()=>navigate('/document-creation')} 
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

export default ResourceForm;