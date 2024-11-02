import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Button, Row, Col, Card } from 'react-bootstrap';
import { createDocument } from '../services/api';

function DocumentInsert() {
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [title, setTitle] = useState('');
    const [stakeholders, setStakeholders] = useState('');
    const [type, setType] = useState('');
    const [scale, setScale] = useState('');
    const [date, setDate] = useState('');
    const [connections, setConnections] = useState(0);
    const [pages, setPages] = useState('Not specified');
    const [language, setLanguage] = useState('Not specified');
    const [longitude, setLongitude] = useState(0.0);
    const [latitude, setLatitude] = useState(0.0);
    const [description, setDescription] = useState('');

    const [stakeholdersArray, setStakeholdersArray] = useState([]);

    const handlestakeholders = (ev) => {
        setStakeholders(ev.target.value);
        setStakeholdersArray(ev.target.value.split(','));
    }

    const validateForm = () => {
        let newErrors = {};
        
        if (!title) newErrors.title = 'Title is required';
        if (!stakeholders) newErrors.stakeholders = 'Stakeholders are required';
        if (!type) newErrors.type = 'Type is required';
        if (!scale) newErrors.scale = 'Scale is required';
        if (!latitude) newErrors.latitude = 'Latitude is required';
        if (!longitude) newErrors.longitude = 'Longitude is required';
        if (!description) newErrors.longitude = 'Description is required';
        if (!date) newErrors.date = 'Date is required';
        if (connections <= 0) newErrors.connections = 'Connections must be at least 1';
    
        setErrors(newErrors);
    
        // Return true if there are no errors, false otherwise
        return Object.keys(newErrors).length === 0;
    };
    

    const handleSubmit = async()=>{
        if (!validateForm()) {
            console.error('Validation failed');
            return;
        }

        const document = {
            title: title,
            stakeholders: stakeholdersArray,
            type: type,
            scale: scale,
            issuance_date: date,
            language: language,
            connections: connections,
            pages: pages,
            description: description,
            coordinates: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
        }

        try {
            await createDocument(document);
            console.log("Document created successfully!");
        } catch (error) {
            console.error("Failed to create a new document:", error);
        }
    };   

    const handleReturnHome = () => {
        navigate('/');
    }

    return (
        <>
        <Card>
            <Card.Title>INSERT DOCUMENT</Card.Title>
            <Card.Body>
                <FloatingLabel
                label="Title of the document"
                className="mb-3"
            >
                <Form.Control type="text" value={title}               
                    onChange={(ev) => setTitle(ev.target.value)}
                    isInvalid={!!errors.title}
                    required={true}/>
                <Form.Control.Feedback type="invalid">
                    {errors.title}
                </Form.Control.Feedback>
            </FloatingLabel>
            <FloatingLabel
                label="Stakeholders"
                className="mb-3"
            >
                <Form.Control type="text"  value={stakeholders}
                    onChange={(ev) => handlestakeholders(ev)}
                    isInvalid={!!errors.stakeholders}
                    required={true}/>
                <Form.Control.Feedback type="invalid">
                    {errors.stakeholders}
                </Form.Control.Feedback>
            </FloatingLabel>
            <FloatingLabel
                label="Scale"
                className="mb-3"
            >
                <Form.Control type="text" value={scale}
                    onChange={(ev) => setScale(ev.target.value)}
                    isInvalid={!!errors.scale}
                    required={true}/>
                <Form.Control.Feedback type="invalid">
                    {errors.scale}
                </Form.Control.Feedback>
            </FloatingLabel>
            <FloatingLabel
                label="Issuance date"
                className="mb-3"
            >
                <Form.Control type="date" value={date}
                    onChange={(ev) => setDate(ev.target.value)}
                    isInvalid={!!errors.date}
                    required={true}/>
            </FloatingLabel>
            <FloatingLabel
                label="Type of the document"
                className="mb-3"
            >
                <Form.Control type="text" value={type}
                    onChange={(ev) => setType(ev.target.value)}
                    isInvalid={!!errors.type}
                    required={true}/>
                <Form.Control.Feedback type="invalid">
                    {errors.type}
                </Form.Control.Feedback>
            </FloatingLabel>
            <FloatingLabel
                label="Connections"
                className="mb-3"
            >
                <Form.Control type="number" value={connections}
                    onChange={(ev) => setConnections(ev.target.value)}
                    isInvalid={!!errors.connections}
                    required={true}/>
                <Form.Control.Feedback type="invalid">
                    {errors.connections}
                </Form.Control.Feedback>
            </FloatingLabel>
            <FloatingLabel
                label="Language"
                className="mb-3"
            >
                <Form.Control type="text" value={language}
                    onChange={(ev) => setLanguage(ev.target.value)}/>
            </FloatingLabel>
            <FloatingLabel
                label="Pages"
                className="mb-3"
            >
                <Form.Control type="text" value={pages}
                    onChange={(ev) => setPages(ev.target.value)}/>
            </FloatingLabel>
            <Row className="align-items-end">
                <Col md={6}>
                        <FloatingLabel
                                label="Latitude"
                                className="mb-3"
                        >
                            <Form.Control type="number" value={latitude}
                                onChange={(ev) => setLatitude(ev.target.value)}
                                isInvalid={!!errors.latitude}
                                required={true}/>
                            <Form.Control.Feedback type="invalid">
                                {errors.latitude}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                </Col>
                <Col md={6}>
                    <FloatingLabel
                        label="Longitude"
                        className="mb-3"
                    >
                        <Form.Control type="number" value={longitude}
                            onChange={(ev) => setLongitude(ev.target.value)}
                            isInvalid={!!errors.longitude}
                            required={true}/>
                        <Form.Control.Feedback type="invalid">
                            {errors.longitude}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                </Col>
            </Row>
            <FloatingLabel
                label="Description"
                className="mb-3"
            >
                <Form.Control type="text" value={description}
                    onChange={(ev) => setDescription(ev.target.value)}
                    isInvalid={!!errors.description}
                    required={true}/>
            </FloatingLabel>
            </Card.Body>
            <div className="buttons">
                <Row>
                    <Col>
                        <Button className="mt-3" variant="dark" onClick={handleSubmit}>Add</Button>
                    </Col>
                    <Col>
                        <Button className="mt-3" variant="dark" onClick={handleReturnHome}>Back</Button>
                    </Col>
                </Row>
            </div>
        </Card>
        </>
  );
}

export default DocumentInsert;