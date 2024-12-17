import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import { createApp } from '../createApp.mjs';  
import Area, { IconPosition } from '../models/Geolocation.mjs'; // Import your Area model
import { saveIconPosition } from '../controllers/geolocationController.mjs';

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
    await IconPosition.deleteMany({});
  });
  it('should create a new area with valid data', async () => {
    const validGeoJSON = {
      geojson: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [21.5708,67.4558],
              [21.5688,67.4538],
              [21.5724,67.4517],
              [21.5763,67.4495],
              [21.5708,67.4558]
 
            ]
          ]
        }
      },
      name: 'Test Area'
    };
    console.log('Request BodyXXXXXXXXX:', JSON.stringify(validGeoJSON));
    const response = await request(app)
      .post('/api/areas') 
      .send(validGeoJSON)
      .set('Content-Type', 'application/json');

      console.log('Response Body:', response.body);
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('success', true);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.have.property('geojson');
    expect(response.body.data.geojson).to.have.property('type', 'Feature');
    expect(response.body.data.geojson.geometry).to.have.property('type', 'Polygon');
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
      .post('/api/areas') // Assuming your route is defined as /areas
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



  it('should save a new icon position with valid data', async () => {
    const requestData = {
      iconId: 'unique-icon-123', 
      position: { lat: 60.0, lng: 15.0 },
      year: 2024,
      month: 12,
    };

    const response = await request(app)
      .post('/api/areas/icon-position')
      .send(requestData)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(201); 
    expect(response.body).to.have.property('iconId', requestData.iconId);
    expect(response.body).to.have.property('currentPosition');
    expect(response.body.currentPosition).to.deep.equal(requestData.position);
  });



  after(async () => {
    // Clean up after all tests
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
 });