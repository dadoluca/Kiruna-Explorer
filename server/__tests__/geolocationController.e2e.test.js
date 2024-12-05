import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import { createApp } from '../createApp.mjs';  
import Area from '../models/Geolocation.mjs'; // Import your Area model

describe('Area API', () => {
  let app;

  before(async () => {
    try {
      await mongoose.connect('mongodb://localhost/your_test_db');
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
      geojson: {
        type: 'Feature',
        properties: {
          name: 'Kiruna Test Area',
        },
        centroid: {
          type: "Point",
          coordinates: [20.3300, 67.8700]
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [20.2253, 67.8558],
              [20.3144, 67.8561],
              [20.3300, 67.87],
              [20.2, 67.84],
              [20.2253, 67.8558]
            ]
          ]
        }
      }
    };
  
    const response = await request(app)
      .post('/areas')
      .send(newArea)
      .expect('Content-Type', /json/)
      .expect(201);
  
    console.log("Full Response Body:", JSON.stringify(response.body, null, 2));
  
    
    expect(response.body).to.have.property('geometry');
    expect(response.body.geometry).to.have.property('coordinates');
    expect(response.body.geometry.coordinates).to.deep.equal(newArea.geojson.geometry.coordinates);
  });
  
  
   it('should return all areas', async () => {
    const response = await request(app).get('/areas');
    console.log("Response for all areas:", JSON.stringify(response.body, null, 2));

    expect(response.status).to.equal(200);
    expect(response.body.length).to.be.greaterThan(0);
  });

  it('should return an area by ID', async () => {
    const newArea = {
      geojson: {
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
    }};
    
    const createResponse = await request(app).post('/areas').send(newArea);
  console.log("Response for created area:", JSON.stringify(createResponse.body, null, 2));

  const createdAreaId = createResponse.body._id;

  const getResponse = await request(app).get(`/areas/${createdAreaId}`);
  console.log("Response for area by ID:", JSON.stringify(getResponse.body, null, 2));

  expect(getResponse.status).to.equal(200);
  expect(getResponse.body).to.have.property('_id');
  expect(getResponse.body._id).to.equal(createdAreaId);
  });

  it('should return 404 if area not found by ID', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/areas/${invalidId}`);
    console.log("Response for invalid area ID:", JSON.stringify(response.body, null, 2));

    expect(response.status).to.equal(404);
    expect(response.body.message).to.equal('Area not found');
  });

  it('should save a new area and calculate centroid', async () => {
    const areaData = {
      points: [
        [
          [67.8558, 20.2253], // [lat, long]
          [67.8561, 20.3144],
          [67.8700, 20.3300],
          [67.8400, 20.2000],
          [67.8558, 20.2253]  // Closing the polygon
        ]
      ],
      name: 'Test Area'
    };

    const response = await request(app)
      .post('/areas') // Assuming your route is defined as /areas
      .send(areaData)
      .expect('Content-Type', /json/)
      .expect(201);

    console.log('Save Area Response:', JSON.stringify(response.body, null, 2));

    // Verify that the response contains valid data
    expect(response.body).to.have.property('_id');
    expect(response.body.properties).to.have.property('name', areaData.name);
    expect(response.body.geometry).to.have.property('type', 'Polygon');
    expect(response.body.geometry.coordinates).to.be.an('array');
    expect(response.body.properties).to.have.property('centroid');
    expect(response.body.properties.centroid).to.have.property('type', 'Point');
    expect(response.body.properties.centroid.coordinates).to.be.an('array');
  });

  after(async () => {
    // Clean up after all tests
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
 });
