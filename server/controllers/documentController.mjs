import Document from '../models/Document.mjs';

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
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('relationships.documentId', 'title type');
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json(document);
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
  const { documentId, type } = req.body;
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const newRelationship = { documentId, type };
    document.relationships.push(newRelationship);
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