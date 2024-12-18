import React, { useEffect, useState, useContext } from 'react';
import Card from 'react-bootstrap/Card';
import { Row, Col } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import PropTypes from "prop-types";
import { FaUser, FaCalendarAlt, FaMapMarkerAlt, FaFileAlt, FaLanguage, FaBook, FaProjectDiagram, FaPlus } from 'react-icons/fa';
import NewLinkModal from './NewLinkModal';
import { useDocumentContext } from '../contexts/DocumentContext';
import { AuthContext } from '../contexts/AuthContext';
import NewResourceModal from './NewResourceModal';
import ResourcesModal from './ResourcesModal';
import styles from './CardDocument.module.css';
import { use } from 'react';

const DetailPlanCard = (props) => {
  const { loggedIn } = useContext(AuthContext);
  const { documents, visualizeDiagram, setVisualizeDiagram, setHighlightedNode, handleDocCardVisualization, getMarker, selectingMode, selectedDocs, setSelectedDocs, checkDocumentPresence } = useDocumentContext();
  const document = documents.find(doc => doc._id === props.doc._id) || {};

  const [showModal, setShowModal] = useState(false);
  const [showModalResource, setShowModalResource] = useState(false);
  const [showResources, setShowResources] = useState(false);
  //console.log(checkDocumentPresence(document));
  const [selected, setSelected] = useState(false);

  const handleAddConnection = async () => {
    setShowModal(false);
  };

  useEffect(() => {
    setSelected(checkDocumentPresence(document));
  }, [document]);

  return (
    <Card className={styles.detailPlanCard}
      style={!props.isListing ? { left: "1rem",  marginBottom: "1rem", borderRadius: "12px", zIndex: "999"  } : {}}
    >
      { selectingMode &&
        <Row>
          <Col md={5} className="text-center">
            <Button
              variant="dark"
              onClick={() => {
                if(!selected){
                  console.log("STO AGGIUNGENDO");
                  setSelectedDocs([...selectedDocs, document]);
                }
                else{
                  setSelectedDocs(selectedDocs.filter(doc => doc._id !== document._id));
                }
                
                setSelected(prev => !prev);
              }}
              size="sm"
              className={`mb-3 ${styles.selectButton}`}
            >
              {selected ?  <><i className="bi bi-x-lg"></i> Deselect</> : <><i class="bi bi-check2"></i> Select </>}
            </Button>
          </Col>
        </Row>
      }

      <Card.Body>

        {/* close button */}
        <button
          className={styles.closeButton}
          onClick={props.onClose}
          aria-label="Close"
          >
            &times;
        </button>

        <Card.Title className={`text-center ${styles.cardTitle}`}>
          <Row>
            <Col>
              {document.title || "N/A"}
            </Col>
              { !visualizeDiagram &&
              <Col>
                <Button
                  variant="light"
                  onClick={() => {setVisualizeDiagram(true); setHighlightedNode(document._id);}}
                  size="sm"
                  className="mb-3"
                >
                  <i class="bi bi-graph-up"></i> Show on diagram
                </Button>
              </Col>
              }
          </Row>

          
        </Card.Title>

        <Card.Text className={styles.description}>
          <strong>Description: </strong> {document.description || "N/A"}
        </Card.Text>

        <ListGroup variant="flush">
          <ListGroup.Item className={styles.listItem}>
            <FaUser className={styles.icon} />
            <strong> Stakeholders:</strong> {document.stakeholders?.length > 0 ? (
              document.stakeholders.map((item) => (
                <div key={item.id} className={styles.stakeholderItem}>{item}</div>
              ))
            ) : "N/A"}
          </ListGroup.Item>
          
          <ListGroup.Item className={styles.listItem}>
            <FaMapMarkerAlt className={styles.icon} />
            <strong> Scale: </strong> {document.scale || "N/A"}
          </ListGroup.Item>

          <ListGroup.Item className={styles.listItem}>
            <FaCalendarAlt className={styles.icon} />
            <strong> Issuance date: </strong> {document.issuance_date || "N/A"}
          </ListGroup.Item>

          <ListGroup.Item className={styles.listItem}>
            <FaFileAlt className={styles.icon} />
            <strong> Type: </strong> {document.type || "N/A"}
          </ListGroup.Item>

          <ListGroup.Item className={styles.listItem}>
            <FaProjectDiagram className={styles.icon} />
            <strong> Connections: </strong> 
            <span className={styles.connectionCount}>{document.connections || 0}</span>

            <Dropdown className={`${styles.dropdownButton}`}>
  <Dropdown.Toggle variant="link" className={styles.dropdownToggle} />
  <Dropdown.Menu>
    {document.relationships?.length > 0 ? (
      document.relationships.map((rel) => (
        <Dropdown.Item
          key={rel.documentId} // Use a unique property as the key
          onClick={() =>
            getMarker(rel.documentId).then((doc) =>
              handleDocCardVisualization(doc)
            )
          }
        >
          {rel.documentTitle} - {rel.type}
        </Dropdown.Item>
      ))
    ) : (
      <Dropdown.Item>No related documents</Dropdown.Item>
    )}
  </Dropdown.Menu>
</Dropdown>


            {loggedIn && (
              <FaPlus
                className={styles.addConnectionIcon}
                onClick={() => setShowModal(true)}
              />
            )}
          </ListGroup.Item>

          <ListGroup.Item className={styles.listItem}>
            <FaLanguage className={styles.icon} />
            <strong> Language: </strong> {document.language || "N/A"}
          </ListGroup.Item>

          <ListGroup.Item className={styles.listItem}>
            <FaBook className={styles.icon} />
            <strong> Pages: </strong> {document.pages || "N/A"}
          </ListGroup.Item>
        </ListGroup>

        <NewLinkModal
          show={showModal}
          onClose={() => setShowModal(false)}
          documentId={document._id}
          documentTitle={document.title}
          onAddConnection={handleAddConnection}
        />

        <NewResourceModal
          show={showModalResource}
          onClose={() => setShowModalResource(false)}
          documentId={document._id}
          documentTitle={document.title}
        />

        <ResourcesModal
          show={showResources}
          onClose={() => setShowResources(false)}
          documentId={document._id}
          documentTitle={document.title}
        />

        <Row>
          <Col>
            <Button
              variant="light"
              onClick={() => setShowResources(true)}
              size="sm"
              className="mb-3"
            >
              <i className="bi bi-folder2-open"></i> Show resources
            </Button>
          </Col>
          <Col>
            {loggedIn && (
              <Button
                variant="light"
                onClick={() => setShowModalResource(true)}
                size="sm"
                className="mb-3"
              >
                <i className="bi bi-file-earmark-medical-fill"></i> Add resources
              </Button>
            )}
          </Col>
          <Col>
            { loggedIn && (
              <Button
                variant="light"
                onClick={() => {
                  props.onClose(); // Close the popup
                  setTimeout(() => {
                    props.onChangeCoordinates(props.doc); // Trigger coordinate change
                    props.onToggleSelecting(true); // Switch to selecting mode
                  }, 0); // Delay execution for a tick
                }}
              
                size="sm"
                className="mb-3"
              >
                <i className="bi bi-geo-alt-fill"></i> Change coordinates
              </Button>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

DetailPlanCard.propTypes = {
  doc: PropTypes.object,
  onClose: PropTypes.func,
  onChangeCoordinates: PropTypes.func.isRequired,
  onToggleSelecting: PropTypes.func.isRequired,
  isListing: PropTypes.bool,
};


export default DetailPlanCard;
