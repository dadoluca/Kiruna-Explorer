import * as chai from 'chai';
const { expect } = chai;
import sinon from 'sinon';
import supertest from 'supertest';
import app from '../app.mjs';  // Assuming app.mjs is your Express app setup
import Document from '../models/Document.mjs';
import * as documentController from '../controllers/documentController.mjs';

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
    it('should return all documents', async () => {
      const documents = [{ title: 'Doc1' }, { title: 'Doc2' }];
      const req = { query: {} };
      const res = { json: sinon.stub() };

      sinon.stub(Document, 'find').resolves(documents);

      await documentController.getAllDocuments(req, res);

      expect(res.json.calledWith(documents)).to.be.true;
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
  
});