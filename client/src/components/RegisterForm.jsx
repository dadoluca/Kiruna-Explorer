import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';

import { AuthContext } from '../contexts/AuthContext';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { handleRegistration } = useContext(AuthContext);


  const handleSubmit = (event) => {
    event.preventDefault();

    const newUser = { name, email, password, role: 'Urban Planner' };
      
    handleRegistration(newUser);
    navigate('/login');

    /*try {
      await API.register(newUser);
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle registration error, e.g., show a message to the user
    }*/
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId='name' className='mb-3'>
        <Form.Label>Name</Form.Label>
        <Form.Control type='text' value={name} onChange={e => setName(e.target.value)} required />
      </Form.Group>

      <Form.Group controlId='email' className='mb-3'>
        <Form.Label>Email</Form.Label>
        <Form.Control type='email' value={email} onChange={e => setEmail(e.target.value)} required />
      </Form.Group>

      <Form.Group controlId='password' className='mb-4'>
        <Form.Label>Password</Form.Label>
        <Form.Control type='password' value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
      </Form.Group>

      <Button type='submit' className='w-100 btn-dark'>Register</Button>
    </Form>
  );
}

export default RegisterForm;
