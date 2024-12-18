import { body, validationResult } from 'express-validator';
import * as turf from '@turf/turf';
import kirunaGeoJSON from '../data/KirunaMunicipality.json' with { type: 'json' };

export const validateArea = [
  body('geojson')
  .isObject()
  .withMessage('The body must contain a valid GeoJSON object.')
  .custom((geojson) => {
    if (geojson.type !== 'Feature') {
      throw new Error('The GeoJSON must be of type "Feature".');
    }

    const { geometry } = geojson;

    if (!geometry || geometry.type !== 'Polygon') {
      throw new Error('The GeoJSON feature must have a geometry of type "Polygon".');
    }

    const coordinates = geometry.coordinates;

    if (!Array.isArray(coordinates) || coordinates.length !== 1) {
      throw new Error('Coordinates must contain exactly one ring (no holes allowed).');
    }

    const ring = coordinates[0];

    if (!Array.isArray(ring) || ring.length < 4) {
      throw new Error('The ring must have at least 4 points.');
    }

    const firstPoint = ring[0];
    const lastPoint = ring[ring.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      throw new Error('The polygon is not closed. The first and last points must match.');
    }

    ring.forEach((point, index) => {
      if (!Array.isArray(point) || point.length !== 2) {
        throw new Error(`Point ${index + 1}: Must be an array of two numbers.`);
      }

      const [longitude, latitude] = point;

      if (typeof longitude !== 'number' || typeof latitude !== 'number') {
        throw new Error(`Point ${index + 1}: Longitude and latitude must be numbers.`);
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error(`Point ${index + 1}: Longitude must be between -180 and 180.`);
      }
      if (latitude < -90 || latitude > 90) {
        throw new Error(`Point ${index + 1}: Latitude must be between -90 and 90.`);
      }

      // Controlla se il punto è all'interno del comune di Kiruna
      const kirunaPolygon = kirunaGeoJSON.features[0].geometry;
      const vertex = turf.point([longitude, latitude]);
      const kiruna = turf.multiPolygon(kirunaPolygon.coordinates);
      if (!turf.booleanPointInPolygon(vertex, kiruna)) {
        throw new Error(`Point ${index + 1}: Must be within the municipality of Kiruna.`);
      }
    });

    return true;
  }),
    
  body('name')
  .optional()
  .isString()
  .withMessage('Name must be a string if provided.'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { 
      console.error('Validation errors:', errors.array());
      return res.status(422).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];