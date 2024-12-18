import React, { useState } from 'react';
import { Container, Col, Card, Form, Button } from 'react-bootstrap';
import styles from './LoginPage.module.css';
import LoginForm from '../components/LoginForm';

function LoginPage() {
  const [role, setRole] = useState('Resident'); 

  
  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <Container className={styles.loginPage}>
      <Col md="12">
        <Card className={styles.loginCard}>
          <Card.Body>
            <Card.Title className={`${styles.title}`}>
              {role === 'Urban Planner' ? 'Urban Planner Login' : 'Resident Login'}
            </Card.Title>
            
            
            <Form.Group controlId="roleSelection" className="mb-3">
              <Form.Label>Select Role</Form.Label>
              <Form.Control as="select" value={role} onChange={handleRoleChange}>
                <option value="Resident">Resident</option>
                <option value="Urban Planner">Urban Planner</option>
              </Form.Control>
            </Form.Group>

            
            <LoginForm role={role} />
          </Card.Body>
        </Card>
      </Col>
    </Container>
  );
}

export default LoginPage;
