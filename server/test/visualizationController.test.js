import * as chai from 'chai';
import sinon from 'sinon';
import supertest from 'supertest';
import app from '../app.mjs';
import Document from '../models/Document.mjs';
import Area from '../models/Geolocation.mjs';
import * as visualizationController from '../controllers/visualizationController.mjs';
import seedrandom from 'seedrandom';

const { expect } = chai;

describe('Visualization Controller', () => {
  afterEach(() => {
    sinon.restore(); // Restore mocked behavior after each test
  });

  describe('Helper Functions', () => {
    it('should format documents for D3.js visualization', () => {
      const mockDocuments = [
        {
          _id: 'doc1',
          title: 'Document 1',
          coordinates: [10, 20],
          relationships: [{ documentId: { _id: 'doc2' }, type: 'related' }],
        },
      ];

      const { nodes, edges } = visualizationController.formatDocumentsForD3(mockDocuments);

      expect(nodes).to.be.an('array').with.lengthOf(1);
      expect(nodes[0]).to.deep.equal({
        id: 'doc1',
        title: 'Document 1',
        coordinates: [10, 20],
        relationships: ['doc2'],
      });

      expect(edges).to.be.an('array').with.lengthOf(1);
      expect(edges[0]).to.deep.equal({
        source: 'doc1',
        target: 'doc2',
        type: 'related',
      });
    });

    it('should handle empty input for documents', () => {
      const { nodes, edges } = visualizationController.formatDocumentsForD3([]);
      expect(nodes).to.be.an('array').that.is.empty;
      expect(edges).to.be.an('array').that.is.empty;
    });

    it('should handle malformed documents for D3.js visualization', () => {
      const malformedDocuments = [
        { _id: 'doc1', title: 'Incomplete Document' }, // Missing relationships and coordinates
      ];

      const { nodes, edges } = visualizationController.formatDocumentsForD3(malformedDocuments);

      expect(nodes).to.be.an('array').with.lengthOf(1);
      expect(nodes[0]).to.include({
        id: 'doc1',
        title: 'Incomplete Document',
      });
      expect(nodes[0]).to.have.property('relationships').that.is.an('array').that.is.empty;
      expect(edges).to.be.an('array').that.is.empty;
    });

    it('should format areas for D3.js visualization', () => {
      const mockAreas = [
        {
          _id: 'area1',
          properties: { name: 'Area 1' },
          geometry: { coordinates: [[[10, 20], [15, 25], [20, 30], [10, 20]]] },
        },
      ];

      const formattedAreas = visualizationController.formatAreasForD3(mockAreas);

      expect(formattedAreas).to.be.an('array').with.lengthOf(1);
      expect(formattedAreas[0]).to.deep.equal({
        id: 'area1',
        name: 'Area 1',
        geometry: [[[10, 20], [15, 25], [20, 30], [10, 20]]],
      });
    });

    it('should handle empty input for areas', () => {
      const formattedAreas = visualizationController.formatAreasForD3([]);
      expect(formattedAreas).to.be.an('array').that.is.empty;
    });

    it('should handle malformed areas for D3.js visualization', () => {
      const malformedAreas = [
        { _id: 'area1', properties: {}, geometry: {} }, // Missing coordinates
      ];

      const formattedAreas = visualizationController.formatAreasForD3(malformedAreas);

      expect(formattedAreas).to.be.an('array').with.lengthOf(1);
      expect(formattedAreas[0]).to.include({ id: 'area1', name: undefined });
      expect(formattedAreas[0]).to.have.property('geometry').that.is.undefined;
    });
  });

  describe('getDocuments', () => {
    it('should fetch documents with multiple entries', async () => {
      const mockDocuments = [
        {
          _id: 'doc1',
          title: 'Document 1',
          coordinates: [10, 20],
          relationships: [{ documentId: { _id: 'doc2' }, type: 'related' }],
        },
        {
          _id: 'doc2',
          title: 'Document 2',
          coordinates: [15, 25],
          relationships: [],
        },
      ];
    
      // Stub the `Document.find().populate().exec()` chain
      sinon.stub(Document, 'find').returns({
        populate: sinon.stub().returns({
          exec: sinon.stub().resolves(mockDocuments), // Ensure `exec` resolves to the mock documents
        }),
      });
    
      const documents = await visualizationController.getDocuments();
    
      expect(documents).to.deep.equal(mockDocuments);
      expect(documents).to.have.lengthOf(2);
      expect(Document.find.calledOnce).to.be.true;
    });
    

    it('should throw an error if fetching documents fails', async () => {
      sinon.stub(Document, 'find').returns({
        populate: sinon.stub().returns({
          exec: sinon.stub().rejects(new Error('Failed to fetch documents.')),
        }),
      });

      try {
        await visualizationController.getDocuments();
      } catch (err) {
        expect(err.message).to.equal('Failed to fetch documents.');
      }
    });

    it('should handle documents with mixed valid and invalid relationships', async () => {
      const mockDocuments = [
        {
          _id: 'doc1',
          title: 'Document 1',
          coordinates: [10, 20],
          relationships: [
            { documentId: { _id: 'doc2' }, type: 'related' }, // Valid
            { documentId: null, type: 'related' }, // Invalid (null reference)
          ],
        },
      ];
    
      // Stub the `Document.find().populate().exec()` chain
      sinon.stub(Document, 'find').returns({
        populate: sinon.stub().returns({
          exec: sinon.stub().resolves(mockDocuments), // Ensure `exec` resolves to the mock documents
        }),
      });
    
      const documents = await visualizationController.getDocuments();
    
      expect(documents).to.deep.equal(mockDocuments);
      expect(documents[0].relationships).to.have.lengthOf(2);
      expect(Document.find.calledOnce).to.be.true;
    });
    
  });

  describe('getAreas', () => {
    it('should fetch areas successfully', async () => {
      const mockAreas = [
        {
          _id: 'area1',
          properties: { name: 'Area 1' },
          geometry: { coordinates: [[[10, 20], [15, 25], [20, 30], [10, 20]]] },
        },
      ];

      sinon.stub(Area, 'find').resolves(mockAreas);

      const areas = await visualizationController.getAreas();

      expect(areas).to.deep.equal(mockAreas);
      expect(Area.find.calledOnce).to.be.true;
    });

    it('should handle empty results from areas', async () => {
      sinon.stub(Area, 'find').resolves([]);

      const areas = await visualizationController.getAreas();

      expect(areas).to.be.an('array').that.is.empty;
      expect(Area.find.calledOnce).to.be.true;
    });
  });

  describe('renderVisualizationData', () => {
    it('should return correctly formatted data with no documents or areas', async () => {
      sinon.stub(Document, 'find').returns({
        populate: sinon.stub().returns({
          exec: sinon.stub().resolves([]),
        }),
      });
      sinon.stub(Area, 'find').resolves([]);

      const response = await supertest(app).get('/api/visualization');

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('nodes').that.is.an('array').that.is.empty;
      expect(response.body).to.have.property('edges').that.is.an('array').that.is.empty;
      expect(response.body).to.have.property('areas').that.is.an('array').that.is.empty;
    });

    

it('should handle large datasets for documents and areas', async () => {
  // Create a deterministic random number generator
  const rng = seedrandom('test-seed');

  const mockDocuments = Array.from({ length: 1000 }, (_, i) => ({
    _id: `doc${i}`,
    title: `Document ${i}`,
    coordinates: [rng() * 100, rng() * 100],
    relationships: i % 2 === 0
      ? []
      : [{ documentId: { _id: `doc${i + 1}` }, type: 'related' }],
  }));

  const mockAreas = [
    {
      _id: 'area1',
      properties: { name: 'Area 1' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[10, 20], [15, 25], [20, 30], [10, 20]]],
      },
    },
  ];

  sinon.stub(Document, 'find').returns({
    populate: sinon.stub().returns({
      exec: sinon.stub().resolves(mockDocuments),
    }),
  });
  sinon.stub(Area, 'find').resolves(mockAreas);

  const response = await supertest(app).get('/api/visualization');

  expect(response.status).to.equal(200);
  expect(response.body).to.have.property('nodes').that.is.an('array');
});

it('should handle large datasets for documents and areas', async () => {
  // Create a seeded random number generator
  const rng = seedrandom('test-seed');

  const mockDocuments = Array.from({ length: 1000 }, (_, i) => ({
    _id: `doc${i}`,
    title: `Document ${i}`,
    coordinates: [rng() * 100, rng() * 100],
    relationships: i % 2 === 0
      ? []
      : [{ documentId: { _id: `doc${i + 1}` }, type: 'related' }],
  }));

  const mockAreas = Array.from({ length: 500 }, (_, i) => ({
    _id: `area${i}`,
    properties: { name: `Area ${i}` },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [rng() * 100, rng() * 100],
          [rng() * 100, rng() * 100],
          [rng() * 100, rng() * 100],
          [rng() * 100, rng() * 100], // Ensure the polygon closes correctly
        ],
      ],
    },
  }));

  // Mock the Document.find and Area.find to return the mock datasets
  sinon.stub(Document, 'find').returns({
    populate: sinon.stub().returns({
      exec: sinon.stub().resolves(mockDocuments), // Mocking successful retrieval of documents
    }),
  });

  sinon.stub(Area, 'find').resolves(mockAreas); // Mocking successful retrieval of areas

  // Make the API request
  const response = await supertest(app).get('/api/visualization');

  // Assert the response
  expect(response.status).to.equal(200);
  expect(response.body.nodes).to.have.lengthOf(1000); // Check that we have 1000 documents
  expect(response.body.areas).to.have.lengthOf(500); // Check that we have 500 areas
});







    it('should propagate errors from getAreas gracefully', async () => {
      sinon.stub(Document, 'find').returns({
        populate: sinon.stub().returns({
          exec: sinon.stub().resolves([]),
        }),
      });
      sinon.stub(Area, 'find').rejects(new Error('Database error'));

      const response = await supertest(app).get('/api/visualization');

      expect(response.status).to.equal(500);
      expect(response.body.message).to.equal('Error preparing data for diagram.');
    });
  });
});



after(() => {
  process.exit(0);  // Ensures Mocha exits after tests
});