import express from 'express';
import multer from 'multer';
import { validateDocument, validateCoordinates } from '../validators/documentValidator.mjs';
import { validateFile } from '../middleware/fileValidation.mjs';
import { 
  createDocument, 
  getAllDocuments, 
  getDocumentById,
  getAllTitles,
  updateDocument, 
  deleteDocument, 
  addRelationship,
  getRelationships,
  updateRelationship,
  deleteRelationship,
  getDocumentsWithSortingPagination, 
  getAvailableDocuments,
  getLinkedDocuments,
  getDocumentsByRelationshipType,
  getRelationshipCount,
  getLinkedDocumentsByDepth,
  bulkAddRelationships,
  getRelationshipTree,
  addTagsToDocument,
  getDocumentsByTag,
  updateCoordinates,
  setToMunicipality,
  uploadResource,
  getResourcesForDocument,
  downloadResource,
  getSelectionFields
} from '../controllers/documentController.mjs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Configure file upload destination

// Document CRUD routes
router.post('/', validateDocument, createDocument);                 // Create a new document
router.get('/', getAllDocuments);
router.get('/paginated', getDocumentsWithSortingPagination);        // Fetch documents with sorting, pagination, and filtering
router.get('/all/titles', getAllTitles);                            // Get all document titles (with optional filters)
router.get('/selection-fields', getSelectionFields);                // Add route for retrieving selection fields
router.get('/:id', getDocumentById);                                // Get a document by ID
router.put('/:id', updateDocument);                                 // Update an existing document by ID
router.delete('/:id', deleteDocument);                              // Delete a document by ID

// Document relationship routes
router.post('/:id/relationships', addRelationship);                 // Add a relationship to a document
router.get('/:id/relationships', getRelationships);                 // Get all relationships for a document
router.put('/:id/relationships/:relationshipId', updateRelationship); // Update a specific relationship
router.delete('/:id/relationships/:relationshipId', deleteRelationship); // Delete a specific relationship
router.get('/:id/available', getAvailableDocuments);

// Document geolocalization routes
router.put('/:id/coordinates', validateCoordinates, updateCoordinates);
router.put('/:id/municipality', setToMunicipality);

// Resource management routes
router.post('/:id/resources', upload.single('file'), validateFile, uploadResource); // Upload a resource for a document
router.get('/:id/resources', getResourcesForDocument); // Retrieve resources associated with a document

// Route to download a specific resource
router.get('/:id/resources/:filename/download', downloadResource);

// Extended relationship routes
router.get('/:id/linked-documents', getLinkedDocuments);            // Get linked documents by relationship type
router.get('/relationships', getDocumentsByRelationshipType);       // Get documents by a specific relationship type
router.get('/:id/relationship-count', getRelationshipCount);        // Get count of each relationship type for a document
router.get('/:id/linked-by-depth', getLinkedDocumentsByDepth);      // Get linked documents by specified depth
router.post('/:id/bulk-relationships', bulkAddRelationships);       // Bulk add relationships to a document
router.get('/:id/relationship-tree', getRelationshipTree);          // Get full relationship tree for a document

// Tag management routes
router.post('/:id/tags', addTagsToDocument);                        // Add tags to a document
router.get('/tags/:tag', getDocumentsByTag);                        // Retrieve documents by a specific tag

export default router;
