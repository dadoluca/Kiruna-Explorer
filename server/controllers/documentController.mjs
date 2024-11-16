import Document from '../models/Document.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// Create a new document
export const createDocument = async (req, res) => {
  try {
    const document = new Document(req.body);
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all documents with optional filters
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find(req.query);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a document by ID
export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      return next(error);
    }
    res.json(document);
  } catch (error) {
    error.statusCode = 500; // Optional: Set specific status if needed
    next(error);
  }
};

// Get all documents with optional filters, retrieving only the title field
export const getAllTitles = async (req, res) => {
  try {
    const documents = await Document.find(req.query).select('title').lean();
    const titles = documents.map(doc => doc.title);
    res.json(titles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing document
export const updateDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a document
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new relationship to a document
export const addRelationship = async (req, res) => {
  const { documentId: newDocumentId, type, title } = req.body;
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const newRelationship = { documentId: newDocumentId, documentTitle: title, type}; 
    document.relationships.push(newRelationship);
    document.connections = (document.connections || 0) + 1;
    await document.save();

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all relationships of a document
export const getRelationships = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('relationships.documentId', 'title type');
    if (!document) return res.status(404).json({ message: 'Document not found' });

    res.json(document.relationships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing relationship of a document
export const updateRelationship = async (req, res) => {
  const { type } = req.body;
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const relationship = document.relationships.id(req.params.relationshipId);
    if (!relationship) return res.status(404).json({ message: 'Relationship not found' });

    relationship.type = type;
    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a relationship of a document
export const deleteRelationship = async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) return res.status(404).json({ message: 'Document not found' });
  
      // Use `pull` to remove the relationship by its ID
      const relationship = document.relationships.id(req.params.relationshipId);
      if (!relationship) return res.status(404).json({ message: 'Relationship not found' });
  
      document.relationships.pull({ _id: req.params.relationshipId });
      await document.save();
  
      res.json({ message: 'Relationship deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// 1. Retrieve linked documents filtered by relationship type
export const getLinkedDocuments = async (req, res) => {
    const { type } = req.query;
    try {
      const document = await Document.findById(req.params.id).populate('relationships.documentId', 'title type');
      if (!document) return res.status(404).json({ message: 'Document not found' });
  
      // Filter relationships by type if specified
      const linkedDocuments = type 
        ? document.relationships.filter(rel => rel.type === type) 
        : document.relationships;
  
      res.json(linkedDocuments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // 2. Retrieve all documents with a specified relationship type
  export const getDocumentsByRelationshipType = async (req, res) => {
    const { type } = req.query;
    try {
      const documents = await Document.find({ 'relationships.type': type }).populate('relationships.documentId', 'title type');
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // 3. Get relationship counts for a specific document
  export const getRelationshipCount = async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) return res.status(404).json({ message: 'Document not found' });
  
      // Count each relationship type
      const relationshipCounts = document.relationships.reduce((counts, rel) => {
        counts[rel.type] = (counts[rel.type] || 0) + 1;
        return counts;
      }, {});
  
      res.json({ documentId: req.params.id, relationshipCounts });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // 4. Retrieve documents by specified link depth (basic depth-based retrieval)
  export const getLinkedDocumentsByDepth = async (req, res) => {
    const { depth = 1 } = req.query; // default depth is 1 for direct links only
    try {
      const linkedDocuments = await fetchDocumentsByDepth(req.params.id, Number(depth));
      res.json(linkedDocuments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Helper function to recursively fetch documents by depth
  const fetchDocumentsByDepth = async (documentId, depth) => {
    if (depth < 1) return [];
    
    const document = await Document.findById(documentId).populate('relationships.documentId', 'title type');
    const directLinks = document.relationships.map(rel => rel.documentId);
  
    // If depth is 1, return direct links only
    if (depth === 1) return directLinks;
  
    // Fetch additional layers of linked documents
    const nestedLinks = await Promise.all(directLinks.map(async (doc) => await fetchDocumentsByDepth(doc._id, depth - 1)));
    
    return [...directLinks, ...nestedLinks.flat()];
  };
  
  // 5. Bulk add relationships to a document
  export const bulkAddRelationships = async (req, res) => {
    const { relationships } = req.body;
    try {
      const document = await Document.findById(req.params.id);
      if (!document) return res.status(404).json({ message: 'Document not found' });
  
      document.relationships.push(...relationships);
      await document.save();
  
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // 6. Retrieve a full relationship tree for a document
  export const getRelationshipTree = async (req, res) => {
    try {
      const relationshipTree = await fetchRelationshipTree(req.params.id);
      res.json(relationshipTree);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Recursive helper function to fetch full relationship tree
  const fetchRelationshipTree = async (documentId) => {
    const document = await Document.findById(documentId).populate('relationships.documentId', 'title type');
    const tree = {
      documentId: document._id,
      title: document.title,
      type: document.type,
      relationships: []
    };
  
    for (const relationship of document.relationships) {
      const childTree = await fetchRelationshipTree(relationship.documentId._id);
      tree.relationships.push({
        relationshipType: relationship.type,
        linkedDocument: childTree
      });
    }
  
    return tree;
  };

  // Add tags to a document
export const addTagsToDocument = async (req, res) => {
    const { tags } = req.body;
    try {
      const document = await Document.findById(req.params.id);
      if (!document) return res.status(404).json({ message: 'Document not found' });
  
      // Add new tags and ensure no duplicates
      document.tags = Array.from(new Set([...document.tags, ...tags]));
      await document.save();
  
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Get documents by tag
  export const getDocumentsByTag = async (req, res) => {
    try {
      const documents = await Document.find({ tags: req.params.tag });
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
//Retrive all document id and titles 
export const getAvailableDocuments = async (req, res) => {
  try {
    const { id: currentDocumentID } = req.params;
    const currentDocument = await Document.findById(currentDocumentID);
    if (!currentDocument) {
      return res.status(400).json({ message: 'Current document not found' });
    }

    // Get IDs of connected documents
    const connectedDocumentIds = currentDocument.relationships.map(rel => rel.documentId);

    // Add currentDocumentID to the list of excluded IDs
    const excludeIds = [...connectedDocumentIds, currentDocumentID];

    // Find available documents excluding connected ones and the current document
    const availableDocuments = await Document.find(
      { _id: { $nin: excludeIds } },
      'title'
    );

    res.json(availableDocuments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch documents with pagination, sorting, and filtering
export const getDocumentsWithSortingPagination = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'title', order = 'asc', filter } = req.query;

    const sortOrder = order === 'desc' ? -1 : 1;
    let query = {};

    if (filter) {
      query = { title: { $regex: filter, $options: 'i' } }; // Case-insensitive filter by title
    }

    const documents = await Document.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalDocuments = await Document.countDocuments(query);

    res.status(200).json({
      data: documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalDocuments / limit),
        totalDocuments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Fetch and sort document fields only for display titles, dates, etc.
export const getDocumentFields = async (req, res, next) => {
  try {
    const fields = await Document.find({}, 'title issuance_date').sort({ title: 1 }).lean();
    res.status(200).json(fields);
  } catch (error) {
    next(error);
  }
};

// Update coordinates of an existing document
export const updateCoordinates = async (req, res) => {
  try {
    const { type, coordinates } = req.body;

    if (!['Point', 'Polygon'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Type must be either "Point" or "Polygon".' });
    }

    // Ensure areaId is removed when updating coordinates
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      { 
        coordinates: { type, coordinates }, 
        $unset: { areaId: "" } // Remove areaId completely (set as undefined)
      },
      { new: true } // Option to return updated document
    );

    if (!updatedDocument) return res.status(404).json({ message: 'Document not found' });

    res.json(updatedDocument);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Set the document's area to the Municipality
export const setToMunicipality = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) return res.status(404).json({ message: 'Document not found' });

    // Set areaId to null and coordinates to an empty array when setting to municipality
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      { 
        areaId: null,  // Set areaId to null to represent municipality
        coordinates: []
      },
      { new: true }
    );

    res.json(updatedDocument);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Retrieve resources for a specific document
export const getResourcesForDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).select('original_resources');
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, resources: document.original_resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload a new resource
export const uploadResource = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find the document by ID
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if file information exists in the request
    if (!req.file || !req.file.filename || !req.file.mimetype) {
      return res.status(400).json({ message: 'File upload failed or invalid file type' });
    }

    // Construct file metadata
    const resource = {
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      url: `/uploads/${req.file.filename}`, // or your URL format
      type: req.file.mimetype,
    };

    // Add resource to document's original_resources array
    document.original_resources.push(resource);
    await document.save();

    res.status(201).json({ message: 'Resource uploaded successfully', resource });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};


// Delete a resource
export const deleteResource = async (req, res) => {
  const { id, resourceId } = req.params;
  try {
    const document = await Document.findById(id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    document.original_resources = document.original_resources.filter(res => res._id.toString() !== resourceId);
    await document.save();

    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all resources of a document
export const getResources = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id, 'original_resources');
    if (!document) return res.status(404).json({ message: 'Document not found' });

    res.status(200).json(document.original_resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update metadata of a resource
export const updateResourceMetadata = async (req, res) => {
  const { id, resourceId } = req.params;
  const { filename, type } = req.body;

  try {
    const document = await Document.findById(id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const resource = document.original_resources.id(resourceId);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (filename) resource.filename = filename;
    if (type) resource.type = type;
    await document.save();

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a document with resources
export const createDocumentWithResources = async (req, res) => {
  try {
    const { resources, ...documentData } = req.body;
    const document = new Document(documentData);

    if (resources && resources.length) {
      document.original_resources = resources;
    }

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update document with additional resources
export const updateDocumentWithResources = async (req, res) => {
  try {
    const { resources, ...documentData } = req.body;
    const document = await Document.findByIdAndUpdate(req.params.id, documentData, { new: true });

    if (!document) return res.status(404).json({ message: 'Document not found' });

    if (resources && resources.length) {
      document.original_resources.push(...resources);
      await document.save();
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Download a specific resource file for a document
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadResource = async (req, res) => {
  const { id, filename } = req.params;
  try {
    // Find the document by ID and check if the resource exists
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Find the resource in the document's original_resources array
    const resource = document.original_resources.find(res => res.filename === filename);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Define the full path to the resource file
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File does not exist on server' });
    }

    // Set headers for download
    res.download(filePath, resource.filename, (err) => {
      if (err) {
        res.status(500).json({ success: false, message: 'Error downloading file' });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};