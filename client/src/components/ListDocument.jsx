import React, { useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from './ListDocument.module.css'; 
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import PropTypes from "prop-types";
import { Row, Col } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { DocumentContext } from '../contexts/DocumentContext'; 

const ScrollableDocumentsList = (props) => {
    const { docList } = useContext(DocumentContext); // Fetch documents from context
    return (
        <div className={styles.scrollableCardList}>
            <Row>
              <Col md={10}>
                <h4 className={styles.scrollbarTitle}>Documents </h4>
              </Col>
              <Col md={2}>
                <Button 
                  className={styles.closeButton} 
                  onClick={() => props.closeList()}
                >
                  <i className="bi bi-x-lg"></i>
              </Button>
              </Col>
            </Row>
            {docList.map((doc, index) => (
                    <Card 
                      bg={'light'}
                      key={'Light'}
                      text={'dark'}
                      style={{ width: '18rem' }}
                      className="mb-2"
                    >
                    <Card.Header>{doc.type}</Card.Header>
                    <Card.Body>
                      <Card.Title> 
                        <img 
                        src={doc.icon} 
                        alt="Icona" 
                        style={{ width: "24px", height: "24px", marginRight: "8px" }} />
                        {doc.title} 
                      </Card.Title>
                      <Card.Text className={styles.cardText}>
                        {doc.description}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <Button variant="dark" onClick={() => props.handleVisualize(doc)}>Visualize document <i className="bi bi-arrows-angle-expand"></i></Button>
                    </Card.Footer>
                  </Card>
            ))}
        </div>
    );
};

ScrollableDocumentsList.propTypes = {
    markers: PropTypes.array,
    handleVisualize: PropTypes.func,
    closeList: PropTypes.func
};

export default ScrollableDocumentsList;