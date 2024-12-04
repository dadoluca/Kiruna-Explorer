import Document from '../models/Document.mjs'; // Import Document model
import Area from '../models/Geolocation.mjs'; // Import Geolocation model

// Fetch all documents
export const getDocuments = async () => {
  try {
    const documents = await Document.find()
      .populate('relationships.documentId') // Populate relationships with document details
      .exec();
    return documents;
  } catch (err) {
    console.error('Error fetching documents:', err);
    throw new Error('Failed to fetch documents.');
  }
};

// Format the documents for D3.js (nodes and edges)
export const formatDocumentsForD3 = (documents) => {
  const nodes = documents.map(doc => ({
    id: doc._id.toString(),
    title: doc.title,
    coordinates: doc.coordinates, // Document's coordinates (Point/Polygon)
    relationships: doc.relationships.map(rel => rel.documentId._id.toString()), // Relationship IDs
  }));

  const edges = documents.flatMap(doc =>
    doc.relationships.map(rel => ({
      source: doc._id.toString(),
      target: rel.documentId._id.toString(),
      type: rel.type, // Relationship type (e.g., "direct consequence")
    }))
  );

  return { nodes, edges };
};

// Fetch all areas (geolocation data)
export const getAreas = async () => {
  try {
    const areas = await Area.find().exec();
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
  const { getDocuments = () => Document.find().populate('relationships.documentId').exec(), 
          getAreas = () => Area.find().exec() } = dependencies;

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


