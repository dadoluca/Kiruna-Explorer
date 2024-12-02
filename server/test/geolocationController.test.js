import { createArea, getAllAreas } from '../controllers/geolocationController.mjs';
import Area from '../models/Geolocation.mjs';
import express from 'express';
import supertest from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';

// Mock the Area model
sinon.stub(Area, 'find');
sinon.stub(Area.prototype, 'save');

// Set up the Express app
const app = express();
app.use(express.json());
app.post('/areas', createArea);
app.get('/areas', getAllAreas);

describe('Area Controller', () => {
  afterEach(() => {
    sinon.restore(); // Restore original behavior after each test
  });

  describe('createArea', () => {
    it('should create a new area with valid data (Kiruna coordinates)', async () => {
      const mockSave = sinon.stub().resolves(true);
      Area.prototype.save = mockSave;
    
      // Example polygon around Kiruna, using valid coordinates in Kiruna
      const areaData = {
        points: [
          [
            [67.8558, 20.2253],  
            [67.8560, 20.2254],  
            [67.8562, 20.2256],  
            [67.8561, 20.2258],  
            [67.8558, 20.2253],  
          ],
        ],
        name: 'Kiruna Area',
      };
    
      // Call the API
      let response; // Declare response variable here
    
      try {
        response = await supertest(app).post('/areas').send(areaData);
    
        // Log the actual response for debugging
        console.log('Actual response:', response.body);
    
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('type', 'Feature');
    
        // Adjusted expected coordinates to match the inversion and closure of the polygon
        const expectedCoordinates = [
          [
            [20.2253, 67.8558],
            [20.2254, 67.8560],
            [20.2256, 67.8562],
            [20.2258, 67.8561],
            [20.2253, 67.8558],  
          ],
        ];
    
        // Ensure the actual response and expected coordinates match
        expect(response.body.geometry.coordinates).to.deep.equal(expectedCoordinates);
        expect(mockSave.calledOnce).to.be.true;
    
      } catch (err) {
        // Handle the error
        console.error('Error in test:', err);
        throw err;
      }
    });
    
    
    it('should return an error for invalid data', async () => {
      const response = await supertest(app).post('/areas').send({});
      expect(response.status).to.equal(400);
      expect(response.body.message).to.exist;
    });
  });

  describe('getAllAreas', () => {
    it('should fetch all areas', async () => {
      const mockFind = sinon.stub().resolves([
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[12.0, 45.0]] } },
      ]);
      Area.find = mockFind;

      const response = await supertest(app).get('/areas');

      expect(response.status).to.equal(200);
      expect(response.body).to.have.lengthOf(1);
      expect(response.body[0].geometry.coordinates).to.deep.equal([[12.0, 45.0]]);
      expect(mockFind.calledOnce).to.be.true;
    });

    it('should return an error if there is a server issue', async () => {
      const mockFind = sinon.stub().rejects(new Error('Database error'));
      Area.find = mockFind;

      const response = await supertest(app).get('/areas');

      expect(response.status).to.equal(500);
      expect(response.body.message).to.equal('Failed to fetch areas.');
    });
  });
});
