import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';
import PropTypes from "prop-types";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


const CardDoc = (props) => {

    const handleVisualization = (title, description) => {
        console.log(title);
        console.log(description);
    }


    <Card style={{ width: '18rem' }}>
    <Card.Body>
      <Card.Title>{props.title}</Card.Title>
      <Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle>
      <Card.Text>
        {props.description}
      </Card.Text>
      <Button variant="dark" onClick={()=>handleVisualization(props.title, props.description)}><i className="bi bi-arrows-angle-expand"></i></Button>
    </Card.Body>
  </Card>

}

CardDoc.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
};

export default CardDoc;