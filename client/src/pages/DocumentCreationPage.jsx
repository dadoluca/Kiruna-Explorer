import React from 'react';
import { Container, Col, Card } from 'react-bootstrap';
import styles from './DocumentCreationPage.module.css';
import  FormDocument  from '../components/FormDocument';

function DocumentCreationPage() {
  return (
    <Container className={styles.DocmentCreationPage}>
      <Col md="12"> 
        <FormDocument />
      </Col>
    </Container>
  );
}

export default DocumentCreationPage;