import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Button, Row, Col, Card } from 'react-bootstrap';
import API from '../services/api';
import styles from './FormDocument.module.css';

function DocumentInsert() {
    const navigate = useNavigate();
    const location = useLocation(); // Ottieni la posizione
    const { coordinates } = location.state || {}; // Estrai le coordinate dallo stato

    const [errors, setErrors] = useState({});
    const [title, setTitle] = useState('');
    const [stakeholders, setStakeholders] = useState('');
    const [type, setType] = useState('');
    const [customType, setCustomType] = useState(''); // New state for custom document type
    const [scale, setScale] = useState('');
    const [date, setDate] = useState('');
    const [connections] = useState(0);
    const [pages, setPages] = useState('Not specified');
    const [language, setLanguage] = useState('Not specified');
    const [customLanguage, setCustomLanguage] = useState(''); // New state for custom language
    const [longitude, setLongitude] = useState(coordinates ? coordinates.lng : 20.2253); // Imposta le coordinate se disponibili
    const [latitude, setLatitude] = useState(coordinates ? coordinates.lat : 67.8558); // Imposta le coordinate se disponibili
    const [description, setDescription] = useState('');

    const [stakeholdersArray, setStakeholdersArray] = useState([]);

    const handleStakeholders = (ev) => {
        setStakeholders(ev.target.value);
        setStakeholdersArray(ev.target.value.split(','));
    };

    const handleSubmit = async () => {
        console.log('submit');

        if (!validateForm()) {
            console.error('Validation failed');
            return;
        }

        const document = {
            title,
            stakeholders: stakeholdersArray,
            type: customType || type, // Use custom type if provided
            scale,
            issuance_date: date,
            language: customLanguage || language, // Use custom language if provided
            connections,
            pages,
            description,
            coordinates: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
        };

        try {
            console.log(document);
            await API.createDocument(document);
            setTitle('');
            setStakeholders('');
            setType('');
            setScale('');
            setDate('');
            setPages('Not specified');
            setLanguage('Swedish');
            setLongitude(20.2253);
            setLatitude(67.8558);
            setDescription('');
            setCustomType(''); // Reset custom type
            setCustomLanguage(''); // Reset custom language
            alert("Document added successfully!");
            navigate('/');
        } catch (error) {
            console.error("Failed to create a new document:", error);
        }
    };

    const validateForm = () => {
        let newErrors = {};

        if (!title) newErrors.title = 'Title is required';
        if (!stakeholders) newErrors.stakeholders = 'Stakeholders are required';
        if (!(type || customType)) newErrors.type = 'Type is required'; // Check for custom type
        if (!scale) newErrors.scale = 'Scale is required';
        if (!latitude) newErrors.latitude = 'Latitude is required';
        if (!longitude) newErrors.longitude = 'Longitude is required';
        if (!description) newErrors.description = 'Description is required';
        if (!date) newErrors.date = 'Date is required';

        setErrors(newErrors);
        console.log(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return (
        <Card className={styles.formCard}>
            <Card.Title className={styles.cardTitle}>Insert Document</Card.Title>
            <Card.Body>
                <FloatingLabel label="Title of the document" className={styles.formField}>
                    <Form.Control 
                        type="text" 
                        value={title}
                        onChange={(ev) => setTitle(ev.target.value)}
                        isInvalid={!!errors.title}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.title}
                    </Form.Control.Feedback>
                </FloatingLabel>

                <Row>
                    <Col md={6}>
                        <FloatingLabel label="Document Type" className="mb-3">
                            <Form.Select 
                                value={type}
                                onChange={(ev) => {
                                    setType(ev.target.value);
                                    if (ev.target.value !== "Add Custom...") {
                                        setCustomType('');
                                    }
                                }}
                                isInvalid={!!errors.type}
                                required
                            >
                                <option value="">Select a document type</option>
                                <option>Design Doc.</option>
                                <option>Informative Doc.</option>
                                <option>Prescriptive Doc.</option>
                                <option>Technical Doc.</option>
                                <option>Add Custom...</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.type}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label="Language" className="mb-3">
                            <Form.Select 
                                value={language}
                                onChange={(ev) => {
                                    setLanguage(ev.target.value);
                                    if (ev.target.value !== "Add Custom...") {
                                        setCustomLanguage('');
                                    }
                                }}
                            >
                                <option value="Not Specified">Not specified</option>
                                <option value="Swedish">Swedish</option>
                                <option value="English">English</option>
                                <option>Add Custom...</option>
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* Custom Document Type Input */}
                {type === "Add Custom..." && (
                    <FloatingLabel label="Custom Document Type" className="mb-3">
                        <Form.Control 
                            type="text" 
                            value={customType} 
                            onChange={(ev) => setCustomType(ev.target.value)} 
                        />
                    </FloatingLabel>
                )}

                {/* Custom Language Input */}
                {language === "Add Custom..." && (
                    <FloatingLabel label="Custom Language" className="mb-3">
                        <Form.Control 
                            type="text" 
                            value={customLanguage} 
                            onChange={(ev) => setCustomLanguage(ev.target.value)} 
                        />
                    </FloatingLabel>
                )}

                {/* Stakeholders */}
                <FloatingLabel label="Stakeholders" className={styles.formField}>
                    <Form.Control 
                        type="text" 
                        value={stakeholders}
                        onChange={handleStakeholders}
                        isInvalid={!!errors.stakeholders}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.stakeholders}
                    </Form.Control.Feedback>
                </FloatingLabel>
                
                {/* Connections - Non-editable field with value set to 1 */}
                <Row>
                    <Col md={6}>
                        <FloatingLabel label="Connections" className="mb-3">
                            <Form.Control type="number" value={connections} disabled required />
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label="Pages" className="mb-3">
                            <Form.Control 
                                type="text" 
                                value={pages} 
                                onChange={(ev) => setPages(ev.target.value)} 
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <FloatingLabel label="Scale">
                            <Form.Control 
                                type="text" 
                                value={scale}
                                onChange={(ev) => setScale(ev.target.value)}
                                isInvalid={!!errors.scale}
                                required={true}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.scale}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label="Issuance date">
                            <Form.Control
                                type="text" // Change to text to accept custom formats
                                value={date}
                                onChange={(ev) => setDate(ev.target.value)} // Update state with the input value
                                isInvalid={!!errors.date}
                                required={true}
                                placeholder="mm/yyyy or yyyy" // Provide a hint to the user
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.date || "Please enter a valid date in mm/yyyy or yyyy format."}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* Latitude and Longitude */}
                <Row className="align-items-end">
                    <Col md={6}>
                        <FloatingLabel label="Latitude" className="mb-3">
                            <Form.Control
                                type="number"
                                value={latitude}
                                onChange={(ev) => setLatitude(ev.target.value)}
                                isInvalid={!!errors.latitude}
                                required
                                placeholder="67.8558"
                            />
                            <Form.Control.Feedback type="invalid">{errors.latitude}</Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label="Longitude" className="mb-3">
                            <Form.Control
                                type="number"
                                value={longitude}
                                onChange={(ev) => setLongitude(ev.target.value)}
                                isInvalid={!!errors.longitude}
                                required
                                placeholder="20.2253"
                            />
                            <Form.Control.Feedback type="invalid">{errors.longitude}</Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>

                <FloatingLabel label="Description" className="mb-3">
                    <Form.Control
                        type="text"
                        value={description}
                        onChange={(ev) => setDescription(ev.target.value)}
                        isInvalid={!!errors.description}
                        required
                    />
                </FloatingLabel>

                <Row className={`${styles.buttons} mb-3`}>
                    <Col xs={12} md={6}>
                        <Button variant="dark" onClick={handleSubmit} className="w-100">Add</Button>
                    </Col>
                    <Col xs={12} md={6}>
                        <Button variant="dark" onClick={() => navigate('/')} className="w-100">Back</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default DocumentInsert;
