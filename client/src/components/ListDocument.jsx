import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from './ListDocument.module.css'; 
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import PropTypes from "prop-types";
import { Row, Col } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ScrollableDocumentsList = (props) => {
    const markers = props.markers;

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
            {markers.map((marker, index) => (
                    <Card 
                      bg={'light'}
                      key={'Light'}
                      text={'dark'}
                      style={{ width: '18rem' }}
                      className="mb-2"
                    >
                    <Card.Header>{marker.type}</Card.Header>
                    <Card.Body>
                      <Card.Title> 
                        <img 
                        src={marker.icon} 
                        alt="Icona" 
                        style={{ width: "24px", height: "24px", marginRight: "8px" }} />
                        {marker.title} 
                      </Card.Title>
                      <Card.Text className={styles.cardText}>
                        {marker.description}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <Button variant="dark" onClick={() => props.handleVisualize(marker)}>Visualize document <i className="bi bi-arrows-angle-expand"></i></Button>
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