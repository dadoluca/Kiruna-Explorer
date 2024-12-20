import { useState, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Resident'); // Default role
  const [registrationSecret, setRegistrationSecret] = useState('');
  const navigate = useNavigate();
  const { handleRegistration } = useContext(AuthContext);

  const handleSubmit = (event) => {
    event.preventDefault();

    const newUser = {
      name,
      email,
      password,
      role,
      ...(role === 'Urban Planner' && { registrationSecret }), // Include secret key only for Urban Planners
    };

    console.log('User registration data:', newUser);

    handleRegistration(newUser);
    navigate('/login');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="name" className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="email" className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="password" className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </Form.Group>

      <Form.Group controlId="role" className="mb-3">
        <Form.Label>Role</Form.Label>
        <Form.Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="Resident">Resident</option>
          <option value="Urban Planner">Urban Planner</option>
        </Form.Select>
      </Form.Group>

      {role === 'Urban Planner' && (
        <Form.Group controlId="secretKey" className="mb-4">
          <Form.Label>Secret Key</Form.Label>
          <Form.Control
            type="text"
            value={registrationSecret}
            onChange={(e) => setRegistrationSecret(e.target.value)}
            required
          />
        </Form.Group>
      )}

      <Button type="submit" className="w-100 btn-dark">
        Register
      </Button>
    </Form>
  );
}

export default RegisterForm;
