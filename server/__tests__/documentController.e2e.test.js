import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import { createApp } from '../createApp.mjs';  
import Document from '../models/Document.mjs';  

describe('Document API', () => {
  let app;
  let createdDocumentId;

  before(async () => {
    try {
      await mongoose.connect("mongodb://localhost/your_test_db");
      console.log("Connected to MongoDB");

      app = createApp();  

    } catch (err) {
      console.log('Error connecting to DB:', err);
    }
  });

  it('should create a new document', async () => {
    const newDocument = {
      title: 'Test Document',
      stakeholders: ['Stakeholder 1', 'Stakeholder 2'],
      scale: 'Large',
      issuance_date: '2024-01-01',
      type: 'Report',
      connections: 5,
      language: 'English',
      pages: '1',
       coordinates: { "type": "Point", "coordinates": [20.2253, 67.8558] },

      description: 'This is a test document.',
      relationships: [
        {
          documentId: new mongoose.Types.ObjectId(),
          documentTitle: 'Related Document 1',
          type: 'direct consequence'
        }
      ],
      original_resources: [],
      attachments: [],
      tags: ['urgent', 'important']
    };
  
    const response = await request(app)
      .post('/documents')
      .send(newDocument);
  
    expect(response.statusCode).to.equal(201);
    expect(response.body).to.have.property('_id');
    expect(response.body.title).to.equal(newDocument.title);
    expect(response.body.stakeholders).to.deep.equal(newDocument.stakeholders);
    expect(response.body.description).to.equal(newDocument.description);
    expect(response.body.coordinates).to.deep.equal(newDocument.coordinates);
    createdDocumentId = response.body._id;

  console.log('Created Document ID:', createdDocumentId);
  
    
    const receivedRelationships = response.body.relationships.map(rel => ({
        documentId: String(rel.documentId),  
        documentTitle: rel.documentTitle,
        type: rel.type
      }));
    
      const expectedRelationships = newDocument.relationships.map(rel => ({
        documentId: String(rel.documentId),
        documentTitle: rel.documentTitle,
        type: rel.type
      }));
  
    expect(response.body.original_resources).to.deep.equal(newDocument.original_resources);
    expect(response.body.attachments).to.deep.equal(newDocument.attachments);
  });
  
  it('should return all documents', async () => {
    const response = await request(app).get('/documents');
    expect(response.status).to.equal(200);
    expect(response.body.length).to.be.greaterThan(0); 
  });

  it('should return filtered documents based on query', async () => {
    const response = await request(app).get('/documents').query({ title: 'Test Document' });
    expect(response.status).to.equal(200);
    expect(response.body.length).to.be.greaterThan(0); 
    expect(response.body[0].title).to.equal('Test Document');
  });

  it('should return an empty array if no documents match the query', async () => {
    const response = await request(app).get('/documents').query({ title: 'Nonexistent Document' });
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal([]); 
  });

  it('should get a document by ID', async () => {
    console.log('Created Document ID:', createdDocumentId); 
    const response = await request(app).get(`/documents/${createdDocumentId}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('_id');
    expect(response.body._id).to.equal(createdDocumentId);
    expect(response.body.title).to.equal('Test Document');
  });

  it('should return 404 if document is not found by ID', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/documents/${invalidId}`);
    console.log('Response body:', response.body);
    expect(response.status).to.equal(404);
    expect(response.body.message).to.equal('Document not found');
  });
  


  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
});
