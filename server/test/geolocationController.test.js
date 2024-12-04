import { createArea, getAllAreas, saveArea } from '../controllers/geolocationController.mjs';
import Area from '../models/Geolocation.mjs';
import express from 'express';
import supertest from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';

// Set up the Express app
const app = express();
app.use(express.json());
app.post('/areas', createArea);
app.get('/areas', getAllAreas);

describe('Area Controller', () => {
  afterEach(() => {
    sinon.restore(); // Restore mocked behavior after each test
  });

  describe('createArea', () => {
    it('should create a new area with valid data (Kiruna coordinates)', async () => {
      const mockSave = sinon.stub(Area.prototype, 'save').resolves(true);

      const areaData = {
        geojson: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [20.2253, 67.8558],
                [20.2254, 67.8560],
                [20.2256, 67.8562],
                [20.2258, 67.8561],
                [20.2253, 67.8558],
              ],
            ],
          },
        },
        name: 'Kiruna Area',
      };

      const response = await supertest(app).post('/areas').send(areaData);

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('type', 'Feature');
      expect(response.body.properties).to.have.property('centroid');
      expect(response.body.properties).to.have.property('color');
      expect(mockSave.calledOnce).to.be.true;
    });

    it('should add a random color to the properties', async () => {
      const mockSave = sinon.stub(Area.prototype, 'save').resolves(true);

      const areaData = {
        geojson: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [20.2253, 67.8558],
                [20.2254, 67.8560],
                [20.2256, 67.8562],
                [20.2258, 67.8561],
                [20.2253, 67.8558],
              ],
            ],
          },
        },
        name: 'Colored Area',
      };

      const response = await supertest(app).post('/areas').send(areaData);

      expect(response.status).to.equal(201);
      expect(response.body.properties).to.have.property('color').that.matches(/^#[0-9A-Fa-f]{6}$/);
      expect(mockSave.calledOnce).to.be.true;
    });

    it('should return an error if geometry is missing in GeoJSON', async () => {
      const invalidData = {
        geojson: {
          type: 'Feature',
          properties: {},
        },
        name: 'Invalid GeoJSON',
      };

      const response = await supertest(app).post('/areas').send(invalidData);

      expect(response.status).to.equal(400);
      expect(response.body.message).to.exist;
    });

    it('should return an error for invalid data', async () => {
      const response = await supertest(app).post('/areas').send({});
      expect(response.status).to.equal(400);
      expect(response.body.message).to.exist;
    });
  });

  describe('getAllAreas', () => {
    it('should fetch all areas', async () => {
      const mockFind = sinon.stub(Area, 'find').resolves([
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [[[12.0, 45.0]]] },
          properties: { name: 'Test Area' },
        },
      ]);

      const response = await supertest(app).get('/areas');

      expect(response.status).to.equal(200);
      expect(response.body).to.have.lengthOf(1);
      expect(response.body[0].geometry.coordinates).to.deep.equal([[[12.0, 45.0]]]);
      expect(mockFind.calledOnce).to.be.true;
    });

    it('should return an empty list when no areas exist', async () => {
      const mockFind = sinon.stub(Area, 'find').resolves([]);

      const response = await supertest(app).get('/areas');

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array').that.is.empty;
      expect(mockFind.calledOnce).to.be.true;
    });

    it('should return an error if there is a server issue', async () => {
      
      const response = await supertest(app).get('/areas');

      expect(response.status).to.equal(500);
      expect(response.body.message).to.equal('Failed to fetch areas.');
    });
  });

  describe('saveArea', () => {
    it('should correctly save a closed polygon with inverted coordinates', async () => {
      const mockSave = sinon.stub(Area.prototype, 'save').resolves(true);

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
        name: 'Closed Area',
      };

      const response = await supertest(app).post('/areas').send(areaData);

      expect(response.status).to.equal(201);
      expect(response.body.geometry.coordinates).to.deep.equal([
        [
          [20.2253, 67.8558],
          [20.2254, 67.8560],
          [20.2256, 67.8562],
          [20.2258, 67.8561],
          [20.2253, 67.8558],
        ],
      ]);
      expect(mockSave.calledOnce).to.be.true;
    });

    it('should handle polygons with multiple rings', async () => {
      const mockSave = sinon.stub(Area.prototype, 'save').resolves(true);

      const areaData = {
        points: [
          [
            [20.2253, 67.8558],
            [20.2254, 67.8560],
            [20.2256, 67.8562],
            [20.2253, 67.8558], // Outer ring
          ],
          [
            [20.2255, 67.8559],
            [20.2256, 67.8561],
            [20.2254, 67.8557],
            [20.2255, 67.8559], // Inner ring
          ],
        ],
        name: 'Multi-ring Area',
      };

      const response = await supertest(app).post('/areas').send(areaData);

      expect(response.status).to.equal(201);
      expect(response.body.geometry.coordinates).to.have.lengthOf(2); // Two rings
      expect(mockSave.calledOnce).to.be.true;
    });

    it('should return an error if points are missing or invalid', async () => {
      const invalidAreaData = { name: 'Invalid Area' };

      const response = await supertest(app).post('/areas').send(invalidAreaData);

      expect(response.status).to.equal(400);
      expect(response.body.message).to.exist;
    });

    it('should return an error if the polygon is not closed', async () => {
      const invalidAreaData = {
        points: [
          [
            [20.2253, 67.8558],
            [20.2254, 67.8560],
            [20.2256, 67.8562],
          ], // Missing the closing point
        ],
        name: 'Invalid Polygon Area',
      };

      const response = await supertest(app).post('/areas').send(invalidAreaData);

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal('Polygon is not closed.');
    });
  });
});
