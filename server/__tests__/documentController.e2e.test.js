import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import { createApp } from '../createApp.mjs';  
import Document from '../models/Document.mjs'; 
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';



describe('Document API', () => {
  let app;
  let createdDocumentId;
  let relatedDocumentId;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const uploadsPath = path.join(__dirname, '../uploads/');
  afterEach(() => {
    const files = fs.readdirSync(uploadsPath); 
    files.forEach((file) => {
      fs.unlinkSync(path.join(uploadsPath, file)); 
    });
  });
  before(async () => {
    try {
      await mongoose.connect("mongodb://localhost/your_test_db");
      console.log("Connected to MongoDB");

      app = createApp();  
  // Create a document to link relationships to
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
    relationships: [],
    original_resources: [],
    attachments: [],
    tags: ['urgent', 'important']
  };
  relatedDocumentId = new mongoose.Types.ObjectId();
  const response = await request(app)
    .post('/documents')
    .send(newDocument);
  
  expect(response.status).to.equal(201);
  createdDocumentId = response.body._id;
  // console.log('Created Document ID:', createdDocumentId);

 // Create another related document for the relationship
 const relatedDocument = {
  title: 'Related Document 1',
  stakeholders: ['Stakeholder 1'],
  scale: 'Small',
  issuance_date: '2024-01-01',
  type: 'Report',
  connections: 0,
  language: 'English',
  pages: '1',
  coordinates: { "type": "Point", "coordinates": [20.2253, 67.8558] },
  description: 'This is a related document.',
  relationships: [],
  original_resources: [],
  attachments: [],
  tags: ['important']
};

const relatedResponse = await request(app)
  .post('/documents')
  .send(relatedDocument);

expect(relatedResponse.status).to.equal(201);
relatedDocumentId = relatedResponse.body._id;
// console.log('Related Document ID:', relatedDocumentId);

} catch (err) {
  console.log('Error connecting to DB:', err);
  throw err;
}
});

// it('should return fields for all documents sorted by title', async () => {
//   const response = await request(app)
//     .get('/documents/:id') // Add the correct route
//     .expect(200);

//   // Check the structure of the response
//   expect(response.body).to.be.an('array');
//   expect(response.body).to.have.length.greaterThan(0); 
//   expect(response.body[0]).to.have.property('title');
//   expect(response.body[0]).to.have.property('issuance_date');
//   expect(response.body[0].title).to.equal('Related Document 1'); // Sorting check (alphabetically)
// });

beforeEach(async () => {
  await Document.updateOne(
    { _id: createdDocumentId },
    { $set: { relationships: [] } }  
  );
});
it('should add a new relationship to a document', async () => {
  const relationshipData = {
    documentId: relatedDocumentId,
    type: 'direct consequence',
    title: 'Related Document 1'
  };


  const response = await request(app)
  .post(`/documents/${createdDocumentId}/relationships`)  
  .send(relationshipData);
  // console.log('Response Body:', response.body);

  expect(response.status).to.equal(201);
  expect(response.body.relationships).to.have.lengthOf(1);
  expect(response.body.relationships[0]).to.have.property('documentId', relatedDocumentId);
  expect(response.body.relationships[0].documentTitle).to.equal('Related Document 1');
  expect(response.body.relationships[0].type).to.equal('direct consequence');
});

it('should update an existing relationship of a document', async () => {
  // Add a relationship to the document first
  const relationshipData = {
    documentId: relatedDocumentId,
    type: 'direct consequence',
    title: 'Related Document 1'
  };

  const addRelationshipResponse = await request(app)
    .post(`/documents/${createdDocumentId}/relationships`)
    .send(relationshipData);

    // console.log('Response after adding relationship:', addRelationshipResponse.body);

    const relationshipId = addRelationshipResponse.body.relationships[0]._id;
  // console.log('Created Relationship ID:', relationshipId);


    const documentResponse = await request(app).get(`/documents/${createdDocumentId}`);
    // console.log('Document Relationships after creation:' , documentResponse.body.relationships);

    expect(documentResponse.body.relationships).to.have.lengthOf(1);
    expect(documentResponse.body.relationships[0]._id).to.equal(relationshipId);

    const updatedData = {
      type: 'update'  // Update the type to a new value
    };

    const updatedResponse = await request(app)
    .put(`/documents/${createdDocumentId}/relationships/${relationshipId}`)
    .send(updatedData)

    // console.log('Response after updating relationships:',updatedResponse.body);

    expect(updatedResponse.status).to.equal(200);
    expect(updatedResponse.body.relationships[0].type).to.equal('update');
});

it('should update coordinates successfully for a valid request', async () => {
  const updatedCoordinates = {
    type: 'Point',
    "coordinates": [20.2255, 67.8557]

  };

  const response = await request(app)
    .put(`/documents/${createdDocumentId}/coordinates`)
    .send(updatedCoordinates);

  expect(response.status).to.equal(200);
  expect(response.body).to.have.property('coordinates');
  expect(response.body.coordinates).to.deep.equal(updatedCoordinates);

  const updatedDocumentResponse = await request(app).get(`/documents/${createdDocumentId}`);
  expect(updatedDocumentResponse.status).to.equal(200);
  expect(updatedDocumentResponse.body.coordinates).to.deep.equal(updatedCoordinates);
});

it('should set the document to municipality (areaId to null and coordinates to empty array)', async () => {
  // Step 1: Ensure the document exists and has initial values
  const initialDocumentResponse = await request(app).get(`/documents/${createdDocumentId}`);
  expect(initialDocumentResponse.status).to.equal(200);
  expect(initialDocumentResponse.body).to.have.property('areaId'); // Initially, areaId should exist
  expect(initialDocumentResponse.body).to.have.property('coordinates').that.is.not.empty;

  // Step 2: Make the API call to set the document to municipality
  const response = await request(app).put(`/documents/${createdDocumentId}/municipality`);

  // Step 3: Assert the response
  expect(response.status).to.equal(200);
  expect(response.body).to.not.have.property('areaId'); // Check that areaId is removed
  expect(response.body).to.have.property('coordinates').that.is.an('array').that.is.empty;

  // Step 4: Verify changes in the database
  const updatedDocumentResponse = await request(app).get(`/documents/${createdDocumentId}`);
  expect(updatedDocumentResponse.status).to.equal(200);
  expect(updatedDocumentResponse.body).to.not.have.property('areaId'); // Check that areaId is removed
  expect(updatedDocumentResponse.body).to.have.property('coordinates').that.is.an('array').that.is.empty;
});

it('should return 404 if document is not found when setting to municipality', async () => {
  const nonExistentDocumentId = new mongoose.Types.ObjectId();

  const response = await request(app).put(`/documents/${nonExistentDocumentId}/municipality`);

  expect(response.status).to.equal(404);
  expect(response.body).to.have.property('message', 'Document not found');
});


it('should delete a relationship from a document', async () => {
  // Step 1: Add a relationship to the document
  const relationshipData = {
    documentId: relatedDocumentId,
    type: 'direct consequence',
    title: 'Related Document 1'
  };

  const addRelationshipResponse = await request(app)
    .post(`/documents/${createdDocumentId}/relationships`)
    .send(relationshipData);

  expect(addRelationshipResponse.status).to.equal(201);

  const relationshipId = addRelationshipResponse.body.relationships[0]._id;
  // console.log('Created Relationship ID:', relationshipId);

  // Step 2: Delete the relationship
  const deleteResponse = await request(app)
    .delete(`/documents/${createdDocumentId}/relationships/${relationshipId}`);

  expect(deleteResponse.status).to.equal(200);
  expect(deleteResponse.body.message).to.equal('Relationship deleted successfully');

  // Step 3: Verify that the relationship is removed
  const documentResponse = await request(app).get(`/documents/${createdDocumentId}`);
  const relationships = documentResponse.body.relationships;

  expect(relationships).to.be.an('array').that.is.empty;
});


it('should return all relationships of a document', async () => {
  // Add relationship to the main document
  const relationshipData = {
    documentId: relatedDocumentId,
    type: 'direct consequence',
    title: 'Related Document 1'
  };

  await request(app)
    .post(`/documents/${createdDocumentId}/relationships`)
    .send(relationshipData);

  // Test: Get relationships of the main document
  const relationshipsResponse = await request(app)
    .get(`/documents/${createdDocumentId}/relationships`);

  expect(relationshipsResponse.status).to.equal(200);
  expect(relationshipsResponse.body).to.be.an('array');
  expect(relationshipsResponse.body).to.have.lengthOf(1);  

  // Verify the details of the returned relationship
  expect(relationshipsResponse.body[0]).to.include({
    documentTitle: 'Related Document 1',
    type: 'direct consequence'
  });
  // console.log('Response documentId:', relationshipsResponse.body[0].documentId);
  // console.log('Expected relatedDocumentId:', relatedDocumentId);
  // console.log('Type of relatedDocumentId:', typeof relatedDocumentId);
  // console.log('relatedDocumentId (as string):', String(relatedDocumentId));

  expect(relationshipsResponse.body[0].documentId._id).to.equal(relatedDocumentId);


});

it('should return 400 if the current document is not found', async () => {
  const nonExistentDocumentId = new mongoose.Types.ObjectId();

  const response = await request(app)
    .get(`/documents/${nonExistentDocumentId}/available`);

  expect(response.status).to.equal(400);
  expect(response.body.message).to.equal('Current document not found');
});

it('should return available documents for a valid current document', async () => {
  // Create a document to test retrieval
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
    relationships: [],
    original_resources: [],
    attachments: [],
    tags: ['urgent', 'important']
  };

  const createResponse = await request(app)
    .post('/documents')
    .send(newDocument);

  expect(createResponse.status).to.equal(201);
  const currentDocumentId = createResponse.body._id;

  // Attempt to get available documents for the newly created document
  const availableDocumentsResponse = await request(app)
    .get(`/documents/${currentDocumentId}/available`);

  expect(availableDocumentsResponse.status).to.equal(200);
  expect(availableDocumentsResponse.body).to.be.an('array');
  expect(availableDocumentsResponse.body.length).to.be.greaterThan(0); // Check that available documents are returned
});


  it('should create a new document', async () => {
    const newDocument = {
      title: 'Test Document',
      stakeholders: ['Stakeholder 1', 'Stakeholder 2'],
      scale: 'Large',
      issuance_date: '2024-01-01',
      type: 'Report',
      connections: 0,
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

    console.log("XXXXXXRequest Payload:", newDocument);
  
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

  // console.log('Created Document ID:', createdDocumentId);
  
    
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
    
  
    expect(response.body.data.length).to.be.greaterThan(0);
    
    
    response.body.data.forEach((doc) => {
  
  
      expect(doc).to.have.property('title');  
      expect(doc).to.have.property('type');   
      expect(doc).to.have.property('connections');  
      expect(doc.connections).to.be.a('number'); 
  
      expect(doc).to.have.property('tags');
      expect(doc.tags).to.be.an('array'); 
    });
  });
  

  it('should get resources for a document', async () => {
    const response = await request(app).get(`/documents/${createdDocumentId}/resources`);
    expect(response.status).to.equal(200);
    expect(response.body.success).to.be.true;
    expect(response.body.resources).to.be.an('array');
  });

  it('should upload a resource for a document', async () => {
    const testDirectory = path.join(__dirname, 'test_directory');
    console.log('Resolved test directory path:', testDirectory);
  
    if (!fs.existsSync(testDirectory)) {
      fs.mkdirSync(testDirectory);
    }
  
    const tempFilePath = path.join(testDirectory, 'testfile.pdf');
    fs.writeFileSync(tempFilePath, 'This is a test file.');
  
    const response = await request(app)
      .post(`/documents/${createdDocumentId}/resources`)
      .attach('file', tempFilePath) 
      .expect('Content-Type', /json/);
  
    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal('Resource uploaded successfully');
    expect(response.body.resource).to.have.property('filename');
  
  
    fs.unlinkSync(tempFilePath);
    
  });
  it('should delete a resource from a document', async () => {
    const resourceData = { filename: 'testfile.pdf' };
  
    // Upload a resource first
    const uploadResponse = await request(app)
      .post(`/documents/${createdDocumentId}/resources`)
      .attach('file', path.join(__dirname, 'testfile.pdf'));
    expect(uploadResponse.status).to.equal(201);
    
    // Extract the resource ID from the uploaded resource
    const resourceId = uploadResponse.body.resource._id;
    
    // Now delete the resource
    const deleteResponse = await request(app)
      .delete(`/documents/${createdDocumentId}/resources/${resourceId}`);
    expect(deleteResponse.status).to.equal(200);
    expect(deleteResponse.body.message).to.equal('Resource deleted successfully');
  
    // Verify the resource was deleted by checking the document's resources
    const docResponse = await request(app).get(`/documents/${createdDocumentId}`);
    expect(docResponse.status).to.equal(200);
    expect(docResponse.body.resources).to.be.an('array').that.is.empty;
  });
  
  
  it('should return resources for a document', async () => {
    const documentWithResources = await Document.findById(createdDocumentId);
    if (!documentWithResources.original_resources || documentWithResources.original_resources.length === 0) {
      documentWithResources.original_resources.push({
        filename: 'testfile.pdf',
        originalFilename: 'testfile.pdf',
        url: 'http://example.com/testfile.pdf',
        type: 'pdf'
      });
      await documentWithResources.save();
    }
  
    const response = await request(app).get(`/documents/${createdDocumentId}/resources`);
  
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('resources').that.is.an('array');
    expect(response.body.success).to.be.true;
    expect(response.body.resources.length).to.be.greaterThan(0);
    expect(response.body.resources[0]).to.have.property('filename', 'testfile.pdf');
    expect(response.body.resources[0]).to.have.property('url', 'http://example.com/testfile.pdf');
  });
  
  
  it('should download a resource from a document', async () => {
    // Assuming you already have a resource uploaded for the document (from previous tests)
    
    // First, upload a resource to the document (if not already uploaded)
    const uploadResponse = await request(app)
      .post(`/documents/${createdDocumentId}/resources`)
      .attach('file', path.join(__dirname, 'testfile.pdf'));
    expect(uploadResponse.status).to.equal(201);
  
    // Extract the filename from the uploaded resource
    const { filename } = uploadResponse.body.resource;
  
    // Now, test the download functionality
    const downloadResponse = await request(app)
      .get(`/documents/${createdDocumentId}/resources/${filename}`)
      .expect('Content-Type', /pdf/);  // Assuming the resource is a PDF file
  
    expect(downloadResponse.status).to.equal(200);
    expect(downloadResponse.headers['content-disposition']).to.include('attachment');
    expect(downloadResponse.headers['content-type']).to.include('application/pdf');
  });
  
  it('should return filtered documents based on query', async () => {
    const response = await request(app).get('/documents').query({ title: 'Test Document' });
    expect(response.status).to.equal(200);
    expect(response.body.data.length).to.be.greaterThan(0); 
    expect(response.body.data[0].title).to.equal('Test Document');
    
  });

  it('should return an empty array if no documents match the query', async () => {
    const response = await request(app).get('/documents').query({ title: 'Nonexistent Document' });
    expect(response.status).to.equal(200);
    expect(response.body.data).to.deep.equal([]); 
  });

  it('should get a document by ID', async () => {
    // console.log('Created Document ID:', createdDocumentId); 
    const response = await request(app).get(`/documents/${createdDocumentId}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('_id');
    expect(response.body._id).to.equal(createdDocumentId);
    expect(response.body.title).to.equal('Test Document');
  });

  it('should return 404 if document is not found by ID', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/documents/${invalidId}`);
    // console.log('Response body:', response.body);
    expect(response.status).to.equal(404);
    expect(response.body.message).to.equal('Document not found');
  });
  
  it('should return documents with pagination and default limit', async () => {
   
    const response = await request(app).get('/documents').query({ page: 1, limit: 2 });
    expect(response.status).to.equal(200);
    expect(response.body.data.length).to.be.at.most(2); 
    expect(response.body.pagination.currentPage).to.equal(1);
    expect(response.body.pagination.totalPages).to.be.greaterThan(0);
    expect(response.body.pagination.totalDocuments).to.be.greaterThan(0);
  });

  it('should filter documents by title using case-insensitive search', async () => {
    const response = await request(app).get('/documents').query({ title: 'test document' }); 
    expect(response.status).to.equal(200);
    expect(response.body.data.length).to.be.greaterThan(0);
    expect(response.body.data[0].title).to.equal('Test Document'); 
  });

  it('should filter documents by type', async () => {
    const response = await request(app).get('/documents').query({ type: 'Report' });
    expect(response.status).to.equal(200);
    expect(response.body.data.length).to.be.greaterThan(0);
    response.body.data.forEach(doc => expect(doc.type).to.equal('Report'));
  });

  it('should filter documents by tag', async () => {
    const response = await request(app).get('/documents').query({ tag: 'urgent' });
    expect(response.status).to.equal(200);
    expect(response.body.data.length).to.be.greaterThan(0);
    response.body.data.forEach(doc => expect(doc.tags).to.include('urgent'));
  });

  it('should return paginated documents when multiple pages exist', async () => {
    
    await Document.insertMany([
      { title: 'Extra Document 1', type: 'Report', tags: ['extra'] },
      { title: 'Extra Document 2', type: 'Report', tags: ['extra'] },
      { title: 'Extra Document 3', type: 'Report', tags: ['extra'] }
    ]);

    const response = await request(app).get('/documents').query({ page: 2, limit: 2 });
    expect(response.status).to.equal(200);
    expect(response.body.data.length).to.equal(2); 
    expect(response.body.pagination.currentPage).to.equal(2);
  });



  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
});
