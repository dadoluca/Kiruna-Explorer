import React from 'react';
import { Container, Col, Card } from 'react-bootstrap';
import styles from './DocumentCreationPage.module.css';
import  ResourceForm  from '../components/FormResource';

function ResourceCreationPage() {
  return (
    <Container className={styles.ResourceCreationPage}>
      <Col md="12"> 
        <ResourceForm />
      </Col>
    </Container>
  );
}

export default ResourceCreationPage;