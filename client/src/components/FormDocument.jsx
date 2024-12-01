import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Button, Row, Col, Card } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import Select from 'react-select';
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import API from '../services/api';
import styles from './FormDocument.module.css';
import { useDocumentContext } from '../contexts/DocumentContext';
import kirunaGeoJSON from '../data/KirunaMunicipality.json';
import * as turf from "@turf/turf";

function DocumentInsert() {
    const navigate = useNavigate();
    const location = useLocation(); // Get location
    const { coordinates, isMunicipal, customArea } = location.state || {}; // Extract coordinates and isMunicipal state
    const { documents } = useDocumentContext();

    const [errors, setErrors] = useState({});
    const [title, setTitle] = useState('');
    const [stakeholders, setStakeholders] = useState([]);
    const [customStakeholder, setCustomStakeholder] = useState('');
    const [type, setType] = useState('');
    const [customType, setCustomType] = useState(''); // New state for custom document type
    const [scale, setScale] = useState('');
    const [customScale, setCustomScale] = useState(''); // New state for custom scale 
    
    //const [connections] = useState(0);
    const [pages, setPages] = useState('Not specified');
    const [language, setLanguage] = useState('Not specified');
    const [customLanguage, setCustomLanguage] = useState(''); // New state for custom language
    const [longitude, setLongitude] = useState(coordinates ? coordinates.lng : 20.2253); // Set coordinates if available
    const [latitude, setLatitude] = useState(coordinates ? coordinates.lat : 67.8558); // Set coordinates if available
    const [description, setDescription] = useState('');
    const [area, setArea] = useState(customArea || null);
    const [activeButton, setActiveButton] = useState(1);
    // date picker 
    const [date, setDate] = useState(null);
    const [dateFormat, setDateFormat] = useState("yyyy-MM-dd");
    const [formattedDate, setFormattedDate] = useState("");

    const [connections, setConnections] = useState([]);
    const [resources, setResources] = useState([]);

    const kirunaPolygonCoordinates = kirunaGeoJSON.features[0].geometry.coordinates;

    // Handle Stakeholders
    const predefinedStakeholders = [
        { value: 'Kiruna kommun', label: 'Kiruna kommun' },
        { value: 'Residents', label: 'Residents' },
        { value: 'White Arkitekter', label: 'White Arkitekter' },
        { value: 'LKAB', label: 'LKAB' },
        { value: 'White Arkitekter', label: 'White Arkitekter' },
    ];

    const handleStakeholdersChange = (selectedOptions) => {
        setStakeholders(selectedOptions || []);
    };

    const handleCustomStakeholderChange = (ev) => {
        setCustomStakeholder(ev.target.value);
    };

    const addCustomStakeholder = () => {
        if (customStakeholder) {
            const newStakeholder = { value: customStakeholder, label: customStakeholder };
            
            setStakeholders((prevStakeholders) => [
                ...prevStakeholders,
                newStakeholder
            ]);

            setCustomStakeholder('');
        }
    };

    // Handle Connections
    const handleAddConnection = () => {
        setConnections(prev => [
            ...prev,
            {
                selectedDocumentId: '',
                selectedTypes: [],

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

    const handleToggleType = (index, type) => {
        const newConnections = [...connections];
        const selectedTypes = newConnections[index].selectedTypes || [];
    
        if (selectedTypes.includes(type)) {
          newConnections[index].selectedTypes = selectedTypes.filter((t) => t !== type);
        } else {
          newConnections[index].selectedTypes = [...selectedTypes, type];
        }
    
        setConnections(newConnections);
    };

    const getAvailableOptions = (index) => {
        const selectedDocumentIds = connections.map(conn => conn.selectedDocumentId);
        return documents.filter(doc => !selectedDocumentIds.includes(doc._id));
    };

    // Handle Resources
    const handleAddResource = () => {
        setResources(prev => [
          ...prev,
          {
            selectedResource: '',
          }
        ]);
    };

    const handleRemoveResource = (index) => {
        const newResources = [...resources];
        newResources.splice(index, 1);

        setResources(newResources);
    };

    const handleChangeResource = (index, e) =>{
        const newResources = [...resources];
        newResources[index] = e.target.files[0];

        setResources(newResources);
    };
    

    const handleSubmit = async () => {
        console.log('submit');

        if (!validateForm()) {
            console.error('Validation failed');
            return;
        }

        // Create the document object
        var document = {
            title,
            stakeholders: stakeholders.map(stakeholder => stakeholder.value),
            type: customType || type, // Use custom type if provided
            scale,
            issuance_date: formattedDate,
            language: customLanguage || language, // Use custom language if provided
            connections: 0,
            pages,
            description,
            areaId: isMunicipal ? null : undefined, // Set areaId to null if municipal area, else keep it undefined
            coordinates: (isMunicipal || customArea) ? undefined : { // Only include coordinates if not municipal
                type: "Point",
                coordinates: [
                    parseFloat(longitude),
                    parseFloat(latitude)
                ]
            }
        }

        if (customArea) {
            document.areaId = customArea._id;
            document.coordinates= customArea.properties.centroid;
        }

        try {
            console.log(document);
            const newDoc = await API.createDocument(document);

            for (const connection of connections) {
                const selectedDocument = documents.find((doc) => doc._id === connection.selectedDocumentId);
                const selectedTitle = selectedDocument ? selectedDocument.title : '';
        
                for (const type of connection.selectedTypes) {
                  await API.createConnection({
                    documentId: newDoc._id,
                    newDocumentId: connection.selectedDocumentId,
                    type,
                    title: selectedTitle,
                  });
        
                  await API.createConnection({
                    documentId: connection.selectedDocumentId,
                    newDocumentId: newDoc._id,
                    type,
                    title: document.title,
                  });
                }
            }

            await API.addResources(newDoc._id, resources);

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
    
        switch (format) {
            case 1:
                setDateFormat("yyyy-MM-dd");
                break;
            case 2:
                setDateFormat("yyyy-MM");
                break;
            case 3:
                setDateFormat("yyyy");
                break;
            default:
                setDateFormat(null); // Fallback for unexpected formats
        }
    };
    

    const handleDataChange = (date) => {
        if (!dateFormat) {
            console.error("Date format is not set! Please select a format first.");
            return; // Exit to avoid errors
        }
    
        setDate(date);
    
        try {
            const dateString = format(date, dateFormat); // Ensure 'format' is a valid function
            setFormattedDate(dateString);
            console.log(dateString); // Log the correct formatted date
        } catch (error) {
            console.error("Error formatting date:", error);
        }
    };
    

    const validateForm = () => {
        let newErrors = {};

        if (!title) newErrors.title = 'Title is required';
        if (!stakeholders || stakeholders.length === 0) {
            newErrors.stakeholders = 'Stakeholders are required';
        }
        if (!(type || customType)) newErrors.type = 'Type is required'; // Check for custom type
        if (!scale) newErrors.scale = 'Scale is required';
        if (!description) newErrors.description = 'Description is required';
        if (!date) newErrors.date = 'Date is required';

        // Only validate latitude and longitude if not a municipal document
        if (!isMunicipal) {
            if (!latitude) newErrors.latitude = 'Latitude is required';
            if (!longitude) newErrors.longitude = 'Longitude is required';
        }

        setErrors(newErrors);
        console.log(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setTitle('');
        setStakeholders([]);
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

    // Funzione per validare le coordinate
    const validateCoordinates = (lat, lng) => {
        // Converte in numeri e verifica che siano numeri validi
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
    
        // Verifica se la latitudine e la longitudine sono nei limiti
        if (latitude < -90 || latitude > 90) {
            return "Latitude must be between -90 and 90.";
        }
        if (longitude < -180 || longitude > 180) {
            return "Longitude must be between -180 and 180.";
        }
    
        // Verifica se il punto è all'interno del poligono
        const point = turf.point([longitude, latitude]);
        const kiruna = turf.multiPolygon(kirunaPolygonCoordinates);
        if (!turf.booleanPointInPolygon(point, kiruna)) {
            return "The point is not inside the Kiruna municipality.";
        }
    
        return null; // nessun errore
    };
    
    // Utilizzo nel form
    const handleCoordinateChange = (ev, coordinateType) => {
        const value = ev.target.value;
        
        // Aggiorna la latitudine o longitudine in base al tipo di coordinata
        if (coordinateType === "latitude") {
            setLatitude(value);
        } else if (coordinateType === "longitude") {
            setLongitude(value);
        }
    
        // Esegui la validazione delle coordinate
        const error = validateCoordinates(latitude, longitude);
        
        // Se c'è un errore, aggiungilo allo stato degli errori, altrimenti rimuovilo
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            if (error) {
                newErrors[coordinateType] = error;
            } else {
                delete newErrors[coordinateType]; // rimuove l'errore se non c'è
            }
            return newErrors;
        });
    };

    return (
        <Card className={styles.formCard}>
            <Card.Title className={styles.title}><i class="bi bi-file-earmark-fill"></i>Insert Document</Card.Title>
            <Card.Body>
                <FloatingLabel label="Title of the document *" className={styles.formField}>
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
                        <FloatingLabel label="Document Type *" className="mb-3">
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
                    <FloatingLabel label="Custom Document Type *" className="mb-3">
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
                <FloatingLabel className={styles.formField}>
                    <Select
                        isMulti
                        value={stakeholders}
                        onChange={handleStakeholdersChange}
                        options={predefinedStakeholders}
                        placeholder="Select stakeholders *"
                        styles={{
                            menu: (base) => ({
                                ...base,
                                zIndex: 1050
                            }),
                            control: (base) => ({
                                ...base,
                                borderColor: errors.stakeholders ? 'red' : base.borderColor,
                            }),
                        }}
                    />
                    {errors.stakeholders && (
                        <div className="invalid-feedback d-block">
                            {errors.stakeholders}
                        </div>
                    )}
                </FloatingLabel>

                {/* Custom Stakeholder */}
                <FloatingLabel label="Custom Stakeholder *" className="mb-3">
                    <Form.Control
                        type="text"
                        value={customStakeholder}
                        onChange={handleCustomStakeholderChange}
                    />
                </FloatingLabel>

                <Button 
                    variant="light"
                    onClick={addCustomStakeholder}
                    size="sm"
                    className="mb-5"
                >
                    Add Custom Stakeholder to the List
                </Button>

                {/* Connections - Non-editable field with value set to 1 */}
                <Row>
                    <Col md={6}>
                        <FloatingLabel label="Connections *" className="mb-3">
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
                
                {/* Scale */}
                <Row className="mb-3">
                    <Col md={6}>
                        <FloatingLabel label="Scale *" className="mb-3">
                            <Form.Select
                                value={scale}
                                onChange={(ev) => {
                                    setScale(ev.target.value);
                                    if (ev.target.value !== "Add Custom...") {
                                        setCustomScale('');
                                    }
                                }}
                            >   
                                <option value="">Select a scale</option>
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

                    {/* Custom Scale Input */}
                    <Col md={6}>
                        {scale === "Add Custom..." && (
                            <FloatingLabel label="Custom Scale *" className="mb-3">
                                <Form.Control
                                    type="text"
                                    value={customScale}
                                    onChange={(ev) => setCustomScale(ev.target.value)}
                                />
                            </FloatingLabel>
                        )}
                    </Col>
                </Row>
                
                {/* Coordinates */}
                {!isMunicipal && (
                    <Row className="mb-4">
                        <Col md={6}>
                            <FloatingLabel label="Longitude *">
                                <Form.Control 
                                    type="text"
                                    value={longitude}
                                    onChange={(ev) => handleCoordinateChange(ev, "longitude")}
                                    isInvalid={!!errors.longitude}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.longitude}
                                </Form.Control.Feedback>
                            </FloatingLabel>
                        </Col>
                        <Col md={6}>
                            <FloatingLabel label="Latitude *">
                                <Form.Control 
                                    type="text" 
                                    value={latitude} 
                                    onChange={(ev) => handleCoordinateChange(ev, "latitude")}
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

                {/* Date */}
                <Row className="mb-4 d-flex">
                    <Col>
                        <div className="d-flex gap-2 justify-content-center">
                            <Button
                                variant={activeButton === 1 ? 'success' : 'dark'}
                                size="sm"
                                onClick={() => handleDateFormat(1)}
                            >
                                YYYY-MM-DD
                            </Button>
                            <Button
                                variant={activeButton === 2 ? 'success' : 'dark'}
                                size="sm"
                                onClick={() => handleDateFormat(2)}
                            >
                                YYYY-MM
                            </Button>
                            <Button
                                variant={activeButton === 3 ? 'success' : 'dark'}
                                size="sm"
                                onClick={() => handleDateFormat(3)}
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
                            placeholderText="Choose a date *"
                        />
                    </Col>
                </Row>

                <FloatingLabel label="Description *" className={styles.formField}>
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
                
                {/* Connections */}
                {connections.map((connection, index) => {
                    return (
                        <div key={index} className="mb-3">
                            <div className="mb-3">
                                <Select
                                    id={`document-select-${index}`}
                                    value={
                                        connection.selectedDocumentId
                                            ? {
                                                value: connection.selectedDocumentId,
                                                label: documents.find(doc => doc._id === connection.selectedDocumentId)?.title
                                            }
                                            : null
                                    }
                                    onChange={(selectedOption) => handleChange(index, 'selectedDocumentId', selectedOption?.value || '')}
                                    options={getAvailableOptions(index).map(doc => ({
                                        value: doc._id,
                                        label: doc.title
                                    }))}
                                    placeholder="Select a document to connect"
                                    getOptionLabel={(e) => e.label}
                                    isClearable={true}
                                    styles={{
                                        menu: (base) => ({
                                            ...base,
                                            zIndex: 1050
                                        }),
                                        control: (base) => ({
                                            ...base,
                                        }),
                                    }}
                                />
                            </div>
                            
                            {connection.selectedDocumentId && (
                                <div className="mb-3">
                                    <div className="d-flex flex-column">
                                        <Form.Check
                                            type="checkbox"
                                            label="Direct Consequence"
                                            checked={connection.selectedTypes.includes('direct consequence')}
                                            onChange={() => handleToggleType(index, 'direct consequence')}
                                            style={{ textAlign: 'left' }}
                                        />
                                        <Form.Check
                                            type="checkbox"
                                            label="Collateral Consequence"
                                            checked={connection.selectedTypes.includes('collateral consequence')}
                                            onChange={() => handleToggleType(index, 'collateral consequence')}
                                            style={{ textAlign: 'left' }}
                                        />
                                        <Form.Check
                                            type="checkbox"
                                            label="Projection"
                                            checked={connection.selectedTypes.includes('projection')}
                                            onChange={() => handleToggleType(index, 'projection')}
                                            style={{ textAlign: 'left' }}
                                        />
                                        <Form.Check
                                            type="checkbox"
                                            label="Update"
                                            checked={connection.selectedTypes.includes('update')}
                                            onChange={() => handleToggleType(index, 'update')}
                                            style={{ textAlign: 'left' }}
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                variant="light"
                                onClick={() => handleRemoveConnection(index)}
                                size="sm"
                                className="mb-3"
                            >
                                Remove Connection
                            </Button>
                        </div>
                    );
                })}

                {/* Resources */}
                {resources.map((resource, index) => (
                    <div key={index} className="mb-3">
                        <FloatingLabel label="Resource to add" className="mb-3">
                        <Form.Control
                            type="file"
                            onChange={(ev) => handleChangeResource(index, ev)}    //da sistemare
                        />
                        </FloatingLabel>

                        <Button
                            variant="light"
                            onClick={() => handleRemoveResource(index)}
                            size="sm"
                            className="mb-3"
                        >
                            Close
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
                        onClick={handleAddResource}
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
                            onClick={() => navigate('/map')}
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
