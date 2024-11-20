import * as chai from 'chai';
const { expect } = chai;
import sinon from 'sinon';
import supertest from 'supertest';
import app from '../app.mjs';  // Assuming app.mjs is your Express app setup
import Document from '../models/Document.mjs';
import * as documentController from '../controllers/documentController.mjs';
import fs from 'fs'; // Import the 'fs' module
import path from 'path';

const request = supertest(app);

describe('DocumentController', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const req = { body: { title: 'New Document', type: 'Type A' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      sinon.stub(Document.prototype, 'save').resolves(req.body);
  
      await documentController.createDocument(req, res);
  
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.firstCall.args[0]).to.include(req.body);
    });
  });

  describe('getAllDocuments', () => {
    it('should return all documents when no query is provided', async () => {
      const documents = [{ title: 'Doc1' }, { title: 'Doc2' }];
      const req = { query: {} };
      const res = { json: sinon.stub() };
  
      sinon.stub(Document, 'find').resolves(documents);
  
      await documentController.getAllDocuments(req, res);
  
      expect(Document.find.calledWith({})).to.be.true;
      expect(res.json.calledWith(documents)).to.be.true;
    });
  
    it('should filter documents based on query parameters', async () => {
      const query = { title: 'Example Document', issuance_date: '2023-10-12' };
      const filteredDocuments = [{ title: 'Example Document', issuance_date: '2023-10-12' }];
      const req = { query };
      const res = { json: sinon.stub() };
  
      sinon.stub(Document, 'find').resolves(filteredDocuments);
  
      await documentController.getAllDocuments(req, res);
  
      expect(Document.find.calledWith(query)).to.be.true;
      expect(res.json.calledWith(filteredDocuments)).to.be.true;
    });
  
    it('should return 500 if there is a server error', async () => {
      const req = { query: {} };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      sinon.stub(Document, 'find').rejects(new Error('Server error'));
  
      await documentController.getAllDocuments(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: 'Server error' })).to.be.true;
    });
  });

  describe('getDocumentById', () => {
    it('should return a document by ID', async () => {
      const req = { params: { id: 'docId123' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      sinon.stub(Document, 'findById').resolves({ _id: 'docId123', title: 'Doc Title' });
  
      await documentController.getDocumentById(req, res);
  
      expect(res.status.called).to.be.false;
      expect(res.json.calledWith({ _id: 'docId123', title: 'Doc Title' })).to.be.true;
    });
  });
  

  describe('updateDocument', () => {
    it('should update a document by ID', async () => {
      const req = { params: { id: 'docId123' }, body: { title: 'Updated Title' } };
      const res = { json: sinon.stub() };

      sinon.stub(Document, 'findByIdAndUpdate').resolves({ _id: 'docId123', title: 'Updated Title' });

      await documentController.updateDocument(req, res);

      expect(res.json.calledWith({ _id: 'docId123', title: 'Updated Title' })).to.be.true;
    });

    it('should return 404 if document to update not found', async () => {
      const req = { params: { id: 'nonexistentId' }, body: {} };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      sinon.stub(Document, 'findByIdAndUpdate').resolves(null);

      await documentController.updateDocument(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Document not found' })).to.be.true;
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document by ID', async () => {
      const req = { params: { id: 'docId123' } };
      const res = { json: sinon.stub() };

      sinon.stub(Document, 'findByIdAndDelete').resolves({ _id: 'docId123' });

      await documentController.deleteDocument(req, res);

      expect(res.json.calledWith({ message: 'Document deleted successfully' })).to.be.true;
    });

    it('should return 404 if document to delete not found', async () => {
      const req = { params: { id: 'nonexistentId' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      sinon.stub(Document, 'findByIdAndDelete').resolves(null);

      await documentController.deleteDocument(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Document not found' })).to.be.true;
    });
  });
  
  describe('addRelationship', () => {
    it('should add a relationship to a document', async () => {
      const req = { params: { id: 'docId123' }, body: { documentId: 'relDocId', type: 'related' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      const document = { _id: 'docId123', relationships: [], save: sinon.stub().resolves() };
      sinon.stub(Document, 'findById').resolves(document);

      await documentController.addRelationship(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(document.relationships.length).to.equal(1);
    });

    it('should return 404 if document to add relationship not found', async () => {
      const req = { params: { id: 'nonexistentId' }, body: { documentId: 'relDocId', type: 'related' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      sinon.stub(Document, 'findById').resolves(null);

      await documentController.addRelationship(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Document not found' })).to.be.true;
    });
  });

  describe('getAllTitles', () => {
  
    it('should return an array of titles when documents are found', async () => {
      const req = { query: {} };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis()
      };
      const mockDocuments = [
        { title: 'Title 1' },
        { title: 'Title 2' }
      ];
  
      // Mocking Document.find(), .select() e .lean()
      const leanStub = sinon.stub().resolves(mockDocuments);
      const selectStub = sinon.stub().returns({ lean: leanStub });
      const findStub = sinon.stub(Document, 'find').returns({
        select: selectStub
      });
    
      await documentController.getAllTitles(req, res);

      sinon.assert.calledOnceWithExactly(findStub, req.query);
      sinon.assert.calledOnceWithExactly(selectStub, 'title');
      sinon.assert.calledOnceWithExactly(leanStub);

      sinon.assert.calledOnceWithExactly(res.json, ['Title 1', 'Title 2']);
    });
  });

  describe('getAvailableDocuments', () => {
  
    it('should return available documents excluding the current and related documents', async () => {
      const req = { 
        params: { id: 'currentDocumentID' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis()
      };
  
      const mockCurrentDocument = {
        _id: 'currentDocumentID',
        relationships: [
          { documentId: 'doc1' },
          { documentId: 'doc2' }
        ]
      };
      const mockAvailableDocuments = [
        { title: 'Available Doc 1' },
        { title: 'Available Doc 2' }
      ];

      sinon.stub(Document, 'findById').resolves(mockCurrentDocument);
      sinon.stub(Document, 'find').resolves(mockAvailableDocuments);

      await documentController.getAvailableDocuments(req, res);

      sinon.assert.calledOnceWithExactly(Document.findById, 'currentDocumentID');

      sinon.assert.calledOnceWithExactly(Document.find, {
        _id: { $nin: ['doc1', 'doc2', 'currentDocumentID'] }
      }, 'title');

      sinon.assert.calledOnceWithExactly(res.json, mockAvailableDocuments);
    });
  
    it('should return 400 if current document is not found', async () => {
      const req = { 
        params: { id: 'nonExistingID' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis()
      };

      sinon.stub(Document, 'findById').resolves(null);

      await documentController.getAvailableDocuments(req, res);

      sinon.assert.calledOnceWithExactly(res.status, 400);

      sinon.assert.calledOnceWithExactly(res.json, { message: 'Current document not found' });
    });
  
    it('should return 500 if there is a server error', async () => {
      const req = { 
        params: { id: 'currentDocumentID' }
      };
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis()
      };

      sinon.stub(Document, 'findById').rejects(new Error('Server error'));

      await documentController.getAvailableDocuments(req, res);

      sinon.assert.calledOnceWithExactly(res.status, 500);
      sinon.assert.calledOnceWithExactly(res.json, { message: 'Server error' });
    });
  });
  
  describe('downloadResource', () => {
    it('should download a resource file', async () => {
      const req = {
        params: { id: '12345', filename: 'example.pdf' }
      };
      const res = { download: sinon.stub(), status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      const document = {
        _id: '12345',
        original_resources: [{ filename: 'example.pdf' }]
      };
  
      sinon.stub(Document, 'findById').resolves(document);
  
      sinon.stub(fs, 'existsSync').returns(true);

      await documentController.downloadResource(req, res);

      const expectedPath = path.resolve('uploads', 'example.pdf');
      expect(res.download.calledWith(expectedPath, 'example.pdf')).to.be.true;
    });
  
    it('should return 404 if the document is not found', async () => {
      const req = {
        params: { id: '12345', filename: 'example.pdf' }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      sinon.stub(Document, 'findById').resolves(null);
  
      await documentController.downloadResource(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({
        success: false,
        message: 'Document not found'
      })).to.be.true;
    });
  
    it('should return 404 if the resource is not found in the document', async () => {
      const req = {
        params: { id: '12345', filename: 'nonexistent.pdf' }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      const document = {
        _id: '12345',
        original_resources: [{ filename: 'example.pdf' }]
      };
  
      sinon.stub(Document, 'findById').resolves(document);
  
      await documentController.downloadResource(req, res);
  
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({
        success: false,
        message: 'Resource not found'
      })).to.be.true;
    });
  
    it('should return 404 if the file does not exist on the server', async () => {
      const req = {
        params: { id: '12345', filename: 'example.pdf' }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      const document = {
        _id: '12345',
        original_resources: [{ filename: 'example.pdf' }]
      };

      sinon.stub(Document, 'findById').resolves(document);

      sinon.stub(fs, 'existsSync').returns(false);

      await documentController.downloadResource(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({
        success: false,
        message: 'File does not exist on server'
      })).to.be.true;
    });
  
    it('should return 500 if there is an error during download', async () => {
      const req = {
        params: { id: '12345', filename: 'example.pdf' }
      };
      const res = { download: sinon.stub(), status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      const document = {
        _id: '12345',
        original_resources: [{ filename: 'example.pdf' }]
      };

      sinon.stub(Document, 'findById').resolves(document);

      sinon.stub(fs, 'existsSync').returns(true);

      res.download.callsFake((filePath, filename, callback) => {
        callback(new Error('Download error'));
      });

      await documentController.downloadResource(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({
        success: false,
        message: 'Error downloading file'
      })).to.be.true;
    });
  });

  describe('uploadResource', () => {
    it('should upload a resource and associate it with a document', async () => {
      const req = {
        params: { id: 'docId123' },
        file: {
          filename: 'example.pdf',
          originalname: 'Original File Name.pdf',
          mimetype: 'application/pdf',
        },
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      const mockDocument = {
        _id: 'docId123',
        original_resources: [],
        save: sinon.stub().resolves(),
      };
  
      sinon.stub(Document, 'findById').resolves(mockDocument);
  
      await documentController.uploadResource(req, res);
  
      // Check that the resource was added to the document
      expect(mockDocument.original_resources).to.have.lengthOf(1);
      expect(mockDocument.original_resources[0]).to.deep.equal({
        filename: 'example.pdf',
        originalFilename: 'Original File Name.pdf',
        url: '/uploads/example.pdf',
        type: 'application/pdf',
      });
  
      // Check the response
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({
        message: 'Resource uploaded successfully',
        resource: {
          filename: 'example.pdf',
          originalFilename: 'Original File Name.pdf',
          url: '/uploads/example.pdf',
          type: 'application/pdf',
        },
      })).to.be.true;
    });
  
    it('should return 404 if the document is not found', async () => {
      const req = {
        params: { id: 'nonexistentDocId' },
        file: { filename: 'example.pdf', mimetype: 'application/pdf' },
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      sinon.stub(Document, 'findById').resolves(null);
  
      await documentController.uploadResource(req, res);
  
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Document not found' })).to.be.true;
    });
  
    it('should return 400 if the file is invalid', async () => {
      const req = {
        params: { id: 'docId123' },
        file: null, // Simulate missing file
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      sinon.stub(Document, 'findById').resolves({ _id: 'docId123', original_resources: [] });
  
      await documentController.uploadResource(req, res);
  
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: 'File upload failed or invalid file type' })).to.be.true;
    });
  });
  
  
  
  // Test for getDocumentsWithSortingPagination
  describe('getDocumentsWithSortingPagination', () => {
    it('should return paginated documents with sorting and filtering', async () => {
      const req = { query: { page: 1, limit: 2, sortBy: 'title', order: 'asc', filter: 'Test' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      const documents = [{ title: 'Test Document 1' }, { title: 'Test Document 2' }];
      sinon.stub(Document, 'find').returns({
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves(documents),
      });
      sinon.stub(Document, 'countDocuments').resolves(10);

      await documentController.getDocumentsWithSortingPagination(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.called).to.be.true;
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('data').that.is.an('array');
      expect(response.pagination).to.deep.equal({
        currentPage: 1,
        totalPages: 5,
        totalDocuments: 10,
      });
    });
  });

  // Test for getDocumentFields
  describe('getDocumentFields', () => {
    it('should fetch specified fields of documents', async () => {
      const req = {};
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      const next = sinon.stub();
  
      const fields = [
        { title: 'A Document', issuance_date: '2023-01-01' },
        { title: 'B Document', issuance_date: '2023-02-01' },
      ];
      sinon.stub(Document, 'find').returns({
        sort: sinon.stub().returns({
          lean: sinon.stub().resolves(fields),
        }),
      });
  
      await documentController.getDocumentFields(req, res, next);
  
      expect(Document.find.calledWith({}, 'title issuance_date')).to.be.true;
      expect(res.status.calledWith(200)).to.be.true; 
      expect(res.json.calledWith(fields)).to.be.true;
      expect(next.called).to.be.false;
    });
  
    it('should call next with an error if an exception occurs', async () => {
      const req = {};
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      const next = sinon.stub();
  
      const error = new Error('Database error');
      sinon.stub(Document, 'find').throws(error);
  
      await documentController.getDocumentFields(req, res, next);
  
      expect(next.calledWith(error)).to.be.true;
      expect(res.status.called).to.be.false;
      expect(res.json.called).to.be.false;
    });
  });

  // Test for updateCoordinates
  describe('updateCoordinates', () => {
    it('should update coordinates of a document', async () => {
      const req = { params: { id: 'docId123' }, body: { type: 'Point', coordinates: [100, 100] } };
      const res = { json: sinon.stub() };

      const updatedDocument = { _id: 'docId123', coordinates: { type: 'Point', coordinates: [100, 100] } };
      sinon.stub(Document, 'findByIdAndUpdate').resolves(updatedDocument);

      await documentController.updateCoordinates(req, res);

      expect(res.json.calledWith(updatedDocument)).to.be.true;
    });

    it('should return 404 if document not found', async () => {
      const req = { params: { id: 'nonexistentId' }, body: { type: 'Point', coordinates: [100, 100] } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      sinon.stub(Document, 'findByIdAndUpdate').resolves(null);

      await documentController.updateCoordinates(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Document not found' })).to.be.true;
    });
  });

  // Test for setToMunicipality
  describe('setToMunicipality', () => {
    it('should set document to municipality', async () => {
      const req = { params: { id: '12345' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      const document = { _id: '12345', title: 'Test Document' };
      const updatedDocument = { 
        _id: '12345', 
        title: 'Test Document', 
        areaId: null, 
        coordinates: [] 
      };

      sinon.stub(Document, 'findById').resolves(document);

      sinon.stub(Document, 'findByIdAndUpdate').resolves(updatedDocument);

      await documentController.setToMunicipality(req, res);

      expect(Document.findById.calledWith('12345')).to.be.true;

      expect(Document.findByIdAndUpdate.calledWith(
        '12345',
        { areaId: null, coordinates: [] },
        { new: true }
      )).to.be.true;

      expect(res.json.calledWith(updatedDocument)).to.be.true;
    });
  
    it('should return 404 if the document is not found', async () => {
      const req = { params: { id: 'nonexistentId' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      sinon.stub(Document, 'findById').resolves(null);
  
      await documentController.setToMunicipality(req, res);
  
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Document not found' })).to.be.true;
    });
  
    it('should return 400 if there is a validation error', async () => {
      const req = { params: { id: 'invalidId' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      sinon.stub(Document, 'findById').rejects(new Error('Invalid document ID'));
  
      await documentController.setToMunicipality(req, res);
  
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: 'Invalid document ID' })).to.be.true;
    });
  });
  

  // Test for getResourcesForDocument
  describe('getResourcesForDocument', () => {
    it('should fetch resources for a document', async () => {
      const req = { params: { id: 'docId123' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      const document = { _id: 'docId123', original_resources: [{ filename: 'file1.pdf', url: '/uploads/file1.pdf', type: 'application/pdf' }] };
      sinon.stub(Document, 'findById').resolves(document);
  
      await documentController.getResourcesForDocument(req, res);
  
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ success: true, resources: document.original_resources })).to.be.true;
    });
  
    it('should return 404 if document is not found', async () => {
      const req = { params: { id: 'nonexistentId' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      sinon.stub(Document, 'findById').resolves(null);
  
      await documentController.getResourcesForDocument(req, res);
  
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ success: false, message: 'Document not found' })).to.be.true;
    });
  
    it('should return 500 if there is a server error', async () => {
      const req = { params: { id: 'docId123' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      sinon.stub(Document, 'findById').rejects(new Error('Server error'));
  
      await documentController.getResourcesForDocument(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ success: false, message: 'Server error' })).to.be.true;
    });
  });
  

  // Test for uploadResource
  describe('uploadResource', () => {
    it('should upload a resource and add it to a document', async () => {
      const req = {
        params: { id: 'docId123' },
        file: { filename: 'file1.pdf', mimetype: 'application/pdf' },
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      const document = { _id: 'docId123', original_resources: [], save: sinon.stub().resolves() };
      sinon.stub(Document, 'findById').resolves(document);

      await documentController.uploadResource(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWithMatch({
        message: 'Resource uploaded successfully',
        resource: { filename: 'file1.pdf', url: '/uploads/file1.pdf', type: 'application/pdf' },
      })).to.be.true;
    });
  });

  // Test for deleteResource
  describe('deleteResource', () => {
    it('should delete a resource from a document', async () => {
      const req = { params: { id: 'docId123', resourceId: 'resId123' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      const document = {
        _id: 'docId123',
        original_resources: [{ _id: 'resId123', filename: 'file1.pdf' }],
        save: sinon.stub().resolves(),
      };
      sinon.stub(Document, 'findById').resolves(document);

      await documentController.deleteResource(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: 'Resource deleted successfully' })).to.be.true;
    });
  });

  // Test for downloadResource
  describe('downloadResource', () => {
    it('should download a resource file', async () => {
      const req = {
        params: { id: '12345', filename: 'example.pdf' }
      };
      const res = { download: sinon.stub(), status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      const document = {
        _id: '12345',
        original_resources: [{ filename: 'example.pdf' }]
      };
  
      sinon.stub(Document, 'findById').resolves(document);
  
      sinon.stub(fs, 'existsSync').returns(true);

      await documentController.downloadResource(req, res);

      const expectedPath = path.resolve('uploads', 'example.pdf');
      expect(res.download.calledWith(expectedPath, 'example.pdf')).to.be.true;
    });
  
    it('should return 404 if the document is not found', async () => {
      const req = {
        params: { id: '12345', filename: 'example.pdf' }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      sinon.stub(Document, 'findById').resolves(null);
  
      await documentController.downloadResource(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({
        success: false,
        message: 'Document not found'
      })).to.be.true;
    });
  
    it('should return 404 if the resource is not found in the document', async () => {
      const req = {
        params: { id: '12345', filename: 'nonexistent.pdf' }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      const document = {
        _id: '12345',
        original_resources: [{ filename: 'example.pdf' }]
      };
  
      sinon.stub(Document, 'findById').resolves(document);
  
      await documentController.downloadResource(req, res);
  
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({
        success: false,
        message: 'Resource not found'
      })).to.be.true;
    });
  
    it('should return 404 if the file does not exist on the server', async () => {
      const req = {
        params: { id: '12345', filename: 'example.pdf' }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
  
      const document = {
        _id: '12345',
        original_resources: [{ filename: 'example.pdf' }]
      };

      sinon.stub(Document, 'findById').resolves(document);

      sinon.stub(fs, 'existsSync').returns(false);

      await documentController.downloadResource(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({
        success: false,
        message: 'File does not exist on server'
      })).to.be.true;
    });
  
    it('should return 500 if there is an error during download', async () => {
      const req = {
        params: { id: '12345', filename: 'example.pdf' }
      };
      const res = { download: sinon.stub(), status: sinon.stub().returnsThis(), json: sinon.stub() };

      const document = { _id: 'docId123', original_resources: [{ filename: 'file1.pdf' }] };
      sinon.stub(Document, 'findById').resolves(document);
      sinon.stub(fs, 'existsSync').returns(true);

      await documentController.downloadResource(req, res);

      expect(res.download.calledWithMatch('/uploads/file1.pdf')).to.be.true;
    });
  });
});