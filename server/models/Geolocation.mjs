import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Feature'],
    required: true,
    default: 'Feature'
  },
  properties: {
    name: {
      type: String,
      required: false
    },
    centroid: {
      type: {
        type: String,
        enum: ['Point'], // GeoJSON Point
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (coords) {
            return coords.length === 2; // Must be an array of two numbers
          },
          message: 'Centroid coordinates must be an array of two numbers [longitude, latitude].'
        }
      }
    },
  },
  geometry: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]], // Polygon vertices
      required: true,
      validate: {
        validator: function (coords) {
          // Polygon closes by having the first and last coordinates match
          return coords.every(ring => 
            ring.length > 3 && 
            ring[0][0] === ring[ring.length - 1][0] && 
            ring[0][1] === ring[ring.length - 1][1]
          );
        },
        message: 'Each polygon must have at least 4 vertices, with the first and last coordinates matching.'
      }
    }
  }
});

const Area = mongoose.model('Area', areaSchema);
export default Area;