import mongoose from 'mongoose';

// GeoJSON schema for geographic coordinates
const geoJSONSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point', 'Polygon'], required: true },
  coordinates: { type: Array, required: true }
});

// Relationship schema with optional weight and unique constraint validation
const relationshipSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  type: { 
    type: String, 
    enum: ['direct consequence', 'collateral consequence', 'projection', 'update'], 
    required: true 
  },
  weight: { type: Number, default: 1 } // Optional weight for relationship significance
});

// Unique validation on relationships
relationshipSchema.index({ documentId: 1 }, { unique: true });

// Schema for resource attachments
const resourceSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true }
});

// Main Document schema
const documentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    stakeholders: { type: [String], required: true },
    scale: String,
    issuance_date: String,
    type: String,
    connections: { type: Number, default: 0 },
    language: String,
    pages: String,
    coordinates: {
      type: { type: String, enum: ['Point', 'Polygon'] },
      coordinates: { type: Array }
    },
    areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Area' },
    description: String,
    relationships: [
      {
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        type: { type: String, enum: ['direct consequence', 'collateral consequence', 'projection', 'update'] }
      }
    ],
    original_resources: [
      {
        filename: String,
        url: String,
        type: String
      }
    ],
    attachments: [
      {
        filename: String,
        url: String,
        type: String
      }
    ],
    tags: { type: [String], default: [] } // New tags field for categorization
  });

// Index for faster querying by relationships
documentSchema.index({ 'relationships.documentId': 1 });

// Virtual field to get the count of relationships
documentSchema.virtual('relationshipCount').get(function () {
  return this.relationships.length;
});

export default mongoose.model('Document', documentSchema);
