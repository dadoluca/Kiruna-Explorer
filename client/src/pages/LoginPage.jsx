
import React from 'react';
import { Container, Col, Card } from 'react-bootstrap';
import styles from './LoginPage.module.css';
import  LoginForm  from '../components/LoginForm';

function LoginPage() {
  return (
    <Container className={styles.loginPage}>
      <Col md="12"> 
        <Card className={styles.loginCard}>
          <Card.Body>
            <Card.Title className={`${styles.title}`}>Urban Planner Login</Card.Title>
            <LoginForm />
          </Card.Body>
        </Card>
      </Col>
    </Container>
  );
}

export default LoginPage;
