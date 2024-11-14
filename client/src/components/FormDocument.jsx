import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Button, Row, Col, Card } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import API from '../services/api';
import styles from './FormDocument.module.css';
import { useDocumentContext } from '../contexts/DocumentContext';

function DocumentInsert() {
    const navigate = useNavigate();
    const location = useLocation(); // Get location
    const { coordinates, isMunicipal } = location.state || {}; // Extract coordinates and isMunicipal state
    const { documents } = useDocumentContext();

    const [errors, setErrors] = useState({});
    const [title, setTitle] = useState('');
    const [stakeholders, setStakeholders] = useState('');
    const [type, setType] = useState('');
    const [customType, setCustomType] = useState(''); // New state for custom document type
    const [scale, setScale] = useState('');
    const [customScale, setCustomScale] = useState(''); // New state for custom scale 
    const [date, setDate] = useState(null);
    //const [connections] = useState(0);
    const [pages, setPages] = useState('Not specified');
    const [language, setLanguage] = useState('Not specified');
    const [customLanguage, setCustomLanguage] = useState(''); // New state for custom language
    const [longitude, setLongitude] = useState(coordinates ? coordinates.lng : 20.2253); // Set coordinates if available
    const [latitude, setLatitude] = useState(coordinates ? coordinates.lat : 67.8558); // Set coordinates if available
    const [description, setDescription] = useState('');

    const [activeButton, setActiveButton] = useState(null);
    const [dateFormat, setDateFormat] = useState(false);
    const [formattedDate, setFormattedDate] = useState("");
    const [stakeholdersArray, setStakeholdersArray] = useState([]);

    const [connections, setConnections] = useState([]);

    const handleStakeholders = (ev) => {
        setStakeholders(ev.target.value);
        setStakeholdersArray(ev.target.value.split(','));
    };

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

    const handleSubmit = async () => {
        console.log('submit');

        if (!validateForm()) {
            console.error('Validation failed');
            return;
        }

        // Create the document object
        const document = {
            title,
            stakeholders: stakeholdersArray,
            type: customType || type, // Use custom type if provided
            scale,
            issuance_date: formattedDate,
            language: customLanguage || language, // Use custom language if provided
            connections: 0,
            pages,
            description,
            areaId: isMunicipal ? null : undefined, // Set areaId to null if municipal area, else keep it undefined
            coordinates: isMunicipal ? undefined : { // Only include coordinates if not municipal
                type: "Point",
                coordinates: [
                    parseFloat(longitude),
                    parseFloat(latitude)
                ]
            }
        };

        try {
            console.log(document);
            const newDoc = await API.createDocument(document);

            await Promise.all(connections.map(async (connection) => {
                const selectedDocument = documents.find(doc => doc._id === connection.selectedDocumentId);
                const selectedTitle = selectedDocument ? selectedDocument.title : '';

                await API.createConnection({
                    documentId: newDoc._id,
                    newDocumentId: connection.selectedDocumentId,
                    type: connection.selectedType,
                    title: selectedTitle
                });
                await API.createConnection({
                    documentId: connection.selectedDocumentId,
                    newDocumentId: newDoc._id,
                    type: connection.selectedType,
                    title: document.title
                });
            }));

            // Reset form fields after submission
            resetForm();
            alert("Document added successfully!");
            navigate('/');
        } catch (error) {
            console.error("Failed to create a new document:", error);
        }
    };

    const handleDateFormat = (format) => {
        setActiveButton(format);
        if (format === 1){setDateFormat("yyyy-MM-dd");}
        else if (format === 2){setDateFormat("yyyy-MM");}
        else if (format === 3){setDateFormat("yyyy");}
    };

    const handleDataChange = (date) => {
        setDate(date);
        const dateString = format(date, dateFormat);
        setFormattedDate(dateString);
        console.log(formattedDate)
    }

    const validateForm = () => {
        let newErrors = {};

        if (!title) newErrors.title = 'Title is required';
        if (!stakeholders) newErrors.stakeholders = 'Stakeholders are required';
        if (!(type || customType)) newErrors.type = 'Type is required'; // Check for custom type
        if (!scale) newErrors.scale = 'Scale is required';
        if (!description) newErrors.description = 'Description is required';
        if (!date) newErrors.date = 'Date is required';
        
        // Only validate latitude and longitude if not a municipal document
        if (!isMunicipal) {
            if (!latitude) newErrors.latitude = 'Latitude is required';
            if (!longitude) newErrors.longitude = 'Longitude is required';
        }

        if (connections && connections.length > 0) {
            connections.forEach((connection, index) => {
                if (!connection.selectedDocumentId) {
                    newErrors[`connections[${index}].selectedDocumentId`] = 'Document is required for each connection';
                }
                if (!connection.selectedType) {
                    newErrors[`connections[${index}].selectedType`] = 'Type is required for each connection';
                }
            });
        }

        setErrors(newErrors);
        console.log(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setTitle('');
        setStakeholders('');
        setType('');
        setScale('');
        setDate('');
        setFormattedDate('');
        setPages('Not specified');
        setLanguage('Swedish');
        setLongitude(20.2253);
        setLatitude(67.8558);
        setDescription('');
        setCustomType(''); // Reset custom type
        setCustomLanguage(''); // Reset custom language
        setConnections([]);
    };

    const getAvailableOptions = (index) => {
        const selectedDocumentIds = connections.map(conn => conn.selectedDocumentId);
        return documents.filter(doc => !selectedDocumentIds.includes(doc._id));
    };

    return (
        <Card className={styles.formCard}>
            <Card.Title className={styles.title}><i class="bi bi-file-earmark-fill"></i>Insert Document</Card.Title>
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
                            <Form.Control type="number" value={0} disabled required />
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
                    <Col md={3}>
                        <FloatingLabel label="Scale" className="mb-3">
                            <Form.Select 
                                value={scale}
                                onChange={(ev) => {
                                    setScale(ev.target.value);
                                    if (ev.target.value !== "Add Custom...") {
                                        setCustomScale('');
                                    }
                                }}
                            >
                                <option value="1:1">1:1</option>
                                <option value="1:2">1:2</option>
                                <option value="1:5">1:5</option>
                                <option value="1:10">1:10</option>
                                <option value="1:20">1:20</option>
                                <option value="1:50">1:50</option>
                                <option value="1:100">1:100</option>
                                <option value="1:500">1:500</option>
                                <option value="1:1000">1:1000</option>
                                <option>Add Custom...</option>
                            </Form.Select>
                        </FloatingLabel>
                        <Form.Control.Feedback type="invalid">
                            {errors.scale}
                        </Form.Control.Feedback>
                    </Col>
                </Row>
                {/* Custom Scale Input */}
                {scale === "Add Custom..." && (
                <FloatingLabel label="Custom Scale" className="mb-3">
                    <Form.Control 
                        type="text" 
                        value={customScale} 
                        onChange={(ev) => setCustomScale(ev.target.value)} 
                    />
                </FloatingLabel>
                )}
            
                <Row className="mb-3 d-flex">
                    <Col>
                    <div className="d-flex gap-2">
                                <Button
                                        variant={activeButton === 1 ? 'success' : 'dark'}
                                        size="sm"
                                        onClick={()=>handleDateFormat(1)}
                                >
                                    YYYY-MM-DD
                                </Button>
                                <Button
                                        variant={activeButton === 2 ? 'success' : 'dark'}
                                        size="sm"
                                        onClick={()=>handleDateFormat(2)}
                                >
                                    YYYY-MM
                                </Button>
                                <Button
                                    variant={activeButton === 3 ? 'success' : 'dark'}
                                    size="sm"
                                    onClick={()=>handleDateFormat(3)}
                                >
                                    YYYY
                                </Button>
                        </div>
                    </Col>
                    <Col>
                        <DatePicker
                                selected={date}
                                onChange={(date) => handleDataChange(date)}
                                dateFormat={dateFormat}
                                showPopperArrow={false}
                        />
                    </Col>
                </Row>
    
                {/* Conditionally render Latitude and Longitude fields */}
                {!isMunicipal && (
                    <Row>
                        <Col md={6}>
                            <FloatingLabel label="Longitude">
                                <Form.Control 
                                    type="text"
                                    value={longitude}
                                    onChange={(ev) => setLongitude(ev.target.value)}
                                    isInvalid={!!errors.longitude}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.longitude}
                                </Form.Control.Feedback>
                            </FloatingLabel>
                        </Col>
                        <Col md={6}>
                            <FloatingLabel label="Latitude">
                                <Form.Control 
                                    type="text" 
                                    value={latitude} 
                                    onChange={(ev) => setLatitude(ev.target.value)}
                                    isInvalid={!!errors.latitude}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.latitude}
                                </Form.Control.Feedback>
                            </FloatingLabel>
                        </Col>
                    </Row>
                )}

                <FloatingLabel label="Description" className={styles.formField}>
                    <Form.Control 
                        as="textarea" 
                        value={description}
                        onChange={(ev) => setDescription(ev.target.value)}
                        isInvalid={!!errors.description}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.description}
                    </Form.Control.Feedback>
                </FloatingLabel>

                {connections.map((connection, index) => (
                    <div key={index} className="mb-3">
                        <FloatingLabel label="Document to connect" className="mb-3">
                            <Form.Select
                                value={connection.selectedDocumentId} 
                                onChange={(ev) => handleChange(index, 'selectedDocumentId', ev.target.value)} 
                                isInvalid={!!errors[`connections[${index}].selectedDocumentId`]}
                            >
                                <option value="">Select a Document</option>
                                {getAvailableOptions(index).map((doc) => (
                                    <option key={doc._id} value={doc._id}>
                                        {doc.title}
                                    </option>
                                ))}
                                {/* Display selected document title within the select field */}
                                {connection.selectedDocumentId && (
                                    <option value={connection.selectedDocumentId}>
                                        {documents.find(doc => doc._id === connection.selectedDocumentId)?.title}
                                    </option>
                                )}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors[`connections[${index}].selectedDocumentId`]}
                            </Form.Control.Feedback>
                        </FloatingLabel>

                        <FloatingLabel label="Connection Type" className="mb-3">
                            <Form.Select
                                value={connection.selectedType} 
                                onChange={(ev) => handleChange(index, 'selectedType', ev.target.value)}
                                isInvalid={!!errors[`connections[${index}].selectedType`]} 
                            >
                                <option value="">Select a Connection Type</option>
                                <option value="direct consequence">Direct Consequence</option>
                                <option value="collateral consequence">Collateral Consequence</option>
                                <option value="projection">Projection</option>
                                <option value="update">Update</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors[`connections[${index}].selectedType`]}
                            </Form.Control.Feedback>
                        </FloatingLabel>

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

                <Row className='mt-4'>
                    <Col md={6}>
                        <Button
                        variant="light"
                        onClick={handleAddConnection}
                        size="sm"
                        className="mb-3"
                        >
                            <i class="bi bi-link-45deg"></i>Add Connection
                        </Button>
                    </Col>
                    <Col md={6}>
                        <Button
                        variant="light"
                        onClick={() => navigate('/resource-creation')}
                        size="sm"
                        className="mb-3"
                        >
                            <i class="bi bi-file-earmark-medical-fill"></i> Add resources 
                        </Button>
                    </Col>
                </Row>
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
                            Submit
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default DocumentInsert;
