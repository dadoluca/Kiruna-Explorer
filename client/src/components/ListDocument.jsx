import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from './ListDocument.module.css'; 
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import PropTypes from "prop-types";

const ScrollableDocumentsList = (props) => {
    const markers = props.markers;

    const handleVisualization = (title, description) => {
        props.handleVisualization(title, description);
    }

    return (
        <div className={styles.scrollableCardList}>
            <h4 className={styles.scrollbarTitle}>Document Types</h4>
            {markers.map((marker, index) => (
                    <Card >
                    <Card.Img variant="top" src={marker.icon} />
                    <Card.Header>{marker.type}</Card.Header>
                    <Card.Body>
                      <Card.Title>{marker.title}</Card.Title>
                      <Card.Text>
                        {marker.description}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <Button variant="dark" onClick={() => handleVisualization(marker.title, marker.description)}>Visualize document <i className="bi bi-arrows-angle-expand"></i></Button>
                    </Card.Footer>
                  </Card>
            ))}
        </div>
    );
};

ScrollableDocumentsList.propTypes = {
    markers: PropTypes.array,
};

export default ScrollableDocumentsList;