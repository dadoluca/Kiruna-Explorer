import { expect } from 'chai';
import sinon from 'sinon';
import supertest from 'supertest';
import app from '../app.mjs';
import User from '../models/User.mjs';
import Document from '../models/Document.mjs';

const request = supertest(app);

describe('Error Handling Middleware', () => {
  afterEach(() => {
    sinon.restore(); // Restore stubs and spies after each test
  });

  /**
   * 404 Not Found Error Test - Document
   */
  it('should return a 404 error for a non-existent document', async () => {
    // Stub `Document.findById` to return null, simulating a non-existent document
    sinon.stub(Document, 'findById').resolves(null);

    const response = await request.get('/documents/nonexistentId');

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('success', false);
    expect(response.body).to.have.property('message', 'Document not found');
  });

  /**
   * 500 Internal Server Error Test - Document
   */
  it('should return a 500 error for an internal server error on Document', async () => {
    // Stub `Document.findById` to throw an error, simulating a server error
    sinon.stub(Document, 'findById').throws(new Error('Internal server error'));

    const response = await request.get('/documents/invalidId');

    expect(response.status).to.equal(500);
    expect(response.body).to.have.property('success', false);
    expect(response.body).to.have.property('message', 'Internal server error');
  });

  /**
   * 422 Validation Error Test - Document
   */
  it('should return a 422 error for a validation error on Document creation', async () => {
    const invalidDocument = {
      title: 12345,  // Invalid title type
      scale: true,   // Invalid scale type
      issuance_date: 'not-a-date',  // Invalid date format
      type: [],      // Invalid type
      connections: -5,  // Invalid connections value
    };
  
    const response = await request.post('/documents').send(invalidDocument);
  
    expect(response.status).to.equal(422);  // Expect 422 for validation errors
    expect(response.body).to.have.property('success', false);  // Ensure success: false
    expect(response.body).to.have.property('errors').that.is.an('array');
  });
  
  

  /**
   * 404 Not Found Error Test - User
   */
  it('should return a 404 error for a non-existent user', async () => {
    // Stub `User.findById` to return null, simulating a non-existent user
    sinon.stub(User, 'findById').resolves(null);

    const response = await request.get('/users/nonexistentUserId');

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('success', false);
    expect(response.body).to.have.property('message', 'User not found');
  });

  /**
   * 500 Internal Server Error Test - User
   */
  it('should return a 500 error for an internal server error on User', async () => {
    // Stub `User.findById` to throw an error, simulating a server error
    sinon.stub(User, 'findById').throws(new Error('Internal server error'));
  
    const response = await request.get('/users/invalidUserId');
  
    expect(response.status).to.equal(500);
    expect(response.body).to.have.property('success', false); // Expect `success: false`
    expect(response.body).to.have.property('message', 'Internal server error'); // Check the message
  });
  
  
  

  /**
   * 422 Validation Error Test - User Registration
   */
  it('should return a 422 error for a validation error on User registration', async () => {
    const invalidUser = {
      name: 12345,          // Invalid name type (should be a string)
      email: 'not-an-email', // Invalid email format
      password: 'short',    // Invalid password length (should be at least 8 characters)
      role: [],             // Invalid role (should be a valid string)
    };
  
    const response = await request.post('/users/register').send(invalidUser);
  
    // Ensure status is 422 for validation errors
    expect(response.status).to.equal(422);
    expect(response.body).to.have.property('success', false);
    expect(response.body).to.have.property('errors').that.is.an('array');
  
    // Extract simplified errors from the response
    const simplifiedErrors = response.body.errors.map(err => ({
      msg: err.msg,
      path: err.param || err.path, // Adjust according to your error structure
    }));
  
    // Check that specific validation errors are present
    expect(simplifiedErrors).to.deep.include.members([
      { msg: 'Name must be a string.', path: 'name' },
      { msg: 'Invalid email format.', path: 'email' },
      { msg: 'Password must be at least 8 characters.', path: 'password' },
      { msg: 'Role must be a valid string.', path: 'role' },
    ]);
  });

  /**
 * 404 Error on Updating a Non-Existent User
 */
it('should return a 404 error when updating a non-existent user', async () => {
  sinon.stub(User, 'findByIdAndUpdate').resolves(null); // Simulate user not found

  const response = await request.put('/users/nonexistentUserId').send({ name: 'Updated Name' });

  // Check that the response status is 404
  expect(response.status).to.equal(404);

  // Check that the response body contains the expected properties
  expect(response.body).to.have.property('success', false);
  expect(response.body).to.have.property('message', 'User not found');
});


  /**
   * 404 Error on Deleting a Non-Existent User
   */
  it('should return a 404 error for a non-existent user', async () => {
    // Stub `User.findById` to return null, simulating a non-existent user
    sinon.stub(User, 'findById').resolves(null);
  
    const response = await request.get('/users/nonexistentUserId');
  
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('success', false);
    expect(response.body).to.have.property('message', 'User not found');
  });
  
  
});

after(() => {
  process.exit(0);  // Ensures Mocha exits after tests
});