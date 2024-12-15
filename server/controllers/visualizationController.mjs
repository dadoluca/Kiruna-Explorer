import Document from '../models/Document.mjs'; // Import Document model
import Area from '../models/Geolocation.mjs'; // Import Geolocation model

// Fetch all documents
// Fetch all documents
export const getDocuments = async () => {
  try {
    const documents = await Document.find()
      .populate('relationships.documentId'); // Populate relationships with document details

    return documents || []; // Ensure it returns an array even if no documents are found
  } catch (err) {
    console.error('Error fetching documents:', err);
    throw new Error('Failed to fetch documents.');
  }
};


// Format the documents for D3.js (nodes and edges)
// Format the documents for D3.js (nodes and edges)
export const formatDocumentsForD3 = (documents) => {
  if (!Array.isArray(documents)) {
    console.error('Expected documents to be an array');
    return { nodes: [], edges: [] };  // Return empty arrays if it's not an array
  }

  const nodes = documents.map(doc => ({
    id: doc._id.toString(),
    title: doc.title,
    coordinates: doc.coordinates, // Document's coordinates (Point/Polygon)
    relationships: Array.isArray(doc.relationships) ? 
                   doc.relationships.map(rel => rel.documentId._id.toString()) : [], // Safely handle undefined/empty relationships
  }));

  const edges = documents.flatMap(doc =>
    doc.relationships && Array.isArray(doc.relationships) ? 
    doc.relationships.map(rel => ({
      source: doc._id.toString(),
      target: rel.documentId._id.toString(),
      type: rel.type, // Relationship type (e.g., "direct consequence")
    })) : [] // Ensure we don't try to map undefined or non-array relationships
  );

  return { nodes, edges };
};



// Fetch all areas (geolocation data)
export const getAreas = async () => {
  try {
    // Removed .exec(), using await directly
    const areas = await Area.find();
    return areas;
  } catch (err) {
    console.error('Error fetching areas:', err);
    throw new Error('Failed to fetch areas.');
  }
};

// Format areas for D3.js (GeoJSON)
export const formatAreasForD3 = (areas) => {
  return areas.map(area => ({
    id: area._id.toString(),
    name: area.properties.name,
    geometry: area.geometry.coordinates, // Polygon coordinates
  }));
};

// Combine everything into one API endpoint

export const renderVisualizationData = async (req, res, dependencies = {}) => {
  const { getDocuments = () => Document.find().populate('relationships.documentId'),
          getAreas = () => Area.find() } = dependencies;

  try {
    const documents = await getDocuments();
    const areas = await getAreas();

    

    // Format data for D3.js
    const { nodes, edges } = formatDocumentsForD3(documents);
    const areasForD3 = formatAreasForD3(areas);

    

    // Send the data to the frontend
    res.status(200).json({
      nodes,
      edges,
      areas: areasForD3,
    });
  } catch (err) {
    console.error('Error preparing data for diagram:', err);
    res.status(500).json({ message: 'Error preparing data for diagram.' });
  }
};


