import React from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import PropTypes from "prop-types";
import 'bootstrap/dist/css/bootstrap.min.css';

const DetailPlanCard = (props) => {
  const document = props.doc;

  return (
    <Card style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <Card.Body>
        <Card.Title className="text-center" style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '20px' }}>
          Detail plan for {document.title}
        </Card.Title>

        <ListGroup variant="flush">
          <ListGroup.Item><strong>Stakeholders:</strong> </ListGroup.Item>
          {document.stakeholders.map((item, value)=>{
            return <ListGroup.Item key={item}>{value}</ListGroup.Item>
          })}
          <ListGroup.Item><strong>Scale:</strong> {document.scale}</ListGroup.Item>
          <ListGroup.Item><strong>Issuance date:</strong> {document.date}</ListGroup.Item>
          <ListGroup.Item><strong>Type:</strong> {document.type}</ListGroup.Item>
          <ListGroup.Item><strong>Connections:</strong> {document.connections}</ListGroup.Item>
          <ListGroup.Item><strong>Language:</strong> {document.language}</ListGroup.Item>
          <ListGroup.Item><strong>Pages:</strong> {document.page}</ListGroup.Item>
        </ListGroup>

        <Card.Text style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
          <strong>Description:</strong> {document.description}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

DetailPlanCard.propTypes = {
    doc: PropTypes.object,
    onClose: PropTypes.func
}

export default DetailPlanCard;
