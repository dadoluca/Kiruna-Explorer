import * as chai from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import supertest from 'supertest';
import app from '../app.mjs'; // Import your Express app
import User from '../models/User.mjs';
import * as userController from '../controllers/userController.mjs';

const { expect } = chai;
const request = supertest(app);

describe('UserController', () => {
  afterEach(() => {
    sinon.restore(); // Restores original functionality after each test
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'Password123!',
          role: 'Resident'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const next = sinon.stub();

      sinon.stub(User, 'findOne').resolves(null);
      sinon.stub(User.prototype, 'save').resolves();

      await userController.registerUser(req, res, next);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({ message: 'User registered successfully' })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should return 400 if email already exists', async () => {
      const req = {
        body: { email: 'johndoe@example.com' }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const next = sinon.stub();

      sinon.stub(User, 'findOne').resolves({ email: 'johndoe@example.com' });

      await userController.registerUser(req, res, next);

      // Check if `next` was called with an error object containing `statusCode` and `message`
      expect(next.calledOnce).to.be.true;
      const error = next.firstCall.args[0];
      expect(error).to.have.property('statusCode', 400);
      expect(error).to.have.property('message', 'Email already in use');
    });
  });

  describe('loginUser', () => {
    it('should login an existing user and return a token', async () => {
      const req = {
        body: {
          email: 'johndoe@example.com',
          password: 'Password123!'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const next = sinon.stub();

      const user = {
        _id: 'userId123',
        email: 'johndoe@example.com',
        role: 'Resident',
        comparePassword: sinon.stub().resolves(true)
      };

      sinon.stub(User, 'findOne').resolves(user);
      sinon.stub(jwt, 'sign').returns('fake-jwt-token');

      await userController.loginUser(req, res, next);
      expect(res.json.calledWith({
        token: 'fake-jwt-token',
        user: { id: 'userId123', name: undefined, role: 'Resident' }
      })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should return 404 if user not found', async () => {
      const req = { body: { email: 'notfound@example.com', password: 'password' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const next = sinon.stub();

      sinon.stub(User, 'findOne').resolves(null);

      await userController.loginUser(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.have.property('statusCode', 404);
      expect(next.firstCall.args[0]).to.have.property('message', 'User not found');
    });
  });

  describe('getUserById', () => {
    it('should return user details if found', async () => {
      const req = { params: { id: 'userId123' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const next = sinon.stub();
  
      sinon.stub(User, 'findById').resolves({ _id: 'userId123', name: 'John Doe' });
  
      await userController.getUserById(req, res, next);
  
      expect(res.status.called).to.be.false;
      expect(res.json.calledWith({ _id: 'userId123', name: 'John Doe' })).to.be.true;
      expect(next.called).to.be.false;
    });
  
    it('should return 404 if user not found', async () => {
      const req = { params: { id: 'nonexistentId' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const next = sinon.stub();
  
      sinon.stub(User, 'findById').resolves(null);
  
      await userController.getUserById(req, res, next);
  
      expect(next.calledOnce).to.be.true;
      const error = next.firstCall.args[0];
      expect(error).to.have.property('statusCode', 404);
      expect(error).to.have.property('message', 'User not found');
    });
  });
  
  

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const req = {
        params: { id: 'userId123' },
        body: { name: 'Updated Name', email: 'updated@example.com' }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const next = sinon.stub();

      sinon.stub(User, 'findByIdAndUpdate').resolves({ _id: 'userId123', name: 'Updated Name', email: 'updated@example.com' });

      await userController.updateUserProfile(req, res, next);
      expect(res.json.calledWith({ _id: 'userId123', name: 'Updated Name', email: 'updated@example.com' })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should return 404 if user not found', async () => {
      const req = { params: { id: 'nonexistentId' }, body: {} };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const next = sinon.stub();

      sinon.stub(User, 'findByIdAndUpdate').resolves(null);

      await userController.updateUserProfile(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.have.property('statusCode', 404);
      expect(next.firstCall.args[0]).to.have.property('message', 'User not found');
    });
  });
});

after(() => {
  process.exit(0);  // Ensures Mocha exits after tests
});