import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import { createApp } from '../createApp.mjs';  
import Area from '../models/Geolocation.mjs'; // Import your Area model

describe('Area API', () => {
  let app;

  before(async () => {
    try {
      await mongoose.connect('mongodb://localhost/your_test_db', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
      app = createApp();
    } catch (err) {
      console.log('Error connecting to DB:', err);
    }
  });
  

  beforeEach(async () => {
    // Ensure that the collection is clean before each test
    await Area.deleteMany({});
  });

  it('should create a new area with valid data', async () => {
    const newArea = {
      type: 'Feature',
      properties: {
        name: 'Kiruna Test Area',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [20.2253, 67.8558],
            [20.3144, 67.8561],
            [20.3300, 67.8700],
            [20.2000, 67.8400],
            [20.2253, 67.8558]
          ]
        ]
      }
    };
  
    const response = await request(app)
      .post('/areas')
      .send(newArea)
      .expect('Content-Type', /json/)
      .expect(201);
  
    expect(response.body).to.have.property('_id');
    expect(response.body.geometry.coordinates).to.deep.equal(newArea.geometry.coordinates);

  });
  
   it('should return all areas', async () => {
    const response = await request(app).get('/areas');
    expect(response.status).to.equal(200);
    expect(response.body.length).to.be.greaterThan(0);
  });

  it('should return an area by ID', async () => {
    const newArea = {
      type: 'Feature',
      properties: {
        name: 'Test Area',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [20.2253, 67.8558],
            [20.3144, 67.8561],
            [20.3300, 67.8700],
            [20.2000, 67.8400],
            [20.2253, 67.8558]
          ]
        ]
      }
    };
    
    const createResponse = await request(app)
      .post('/areas')
      .send(newArea);

    const createdAreaId = createResponse.body._id;

    const getResponse = await request(app).get(`/areas/${createdAreaId}`);
    expect(getResponse.status).to.equal(200);
    expect(getResponse.body).to.have.property('_id');
    expect(getResponse.body._id).to.equal(createdAreaId);
  });

  it('should return 404 if area not found by ID', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/areas/${invalidId}`);
    expect(response.status).to.equal(404);
    expect(response.body.message).to.equal('Area not found');
  });

  after(async () => {
    // Clean up after all tests
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
});
