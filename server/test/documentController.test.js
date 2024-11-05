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
  
      console.log(res.status.firstCall.args); // Add this line to inspect the status call
  
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(req.body)).to.be.true;
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
});
