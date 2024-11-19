import { body, validationResult } from 'express-validator';
import * as turf from '@turf/turf';

const kirunaPolygon = {
  type: "Polygon",
  coordinates: [
    [
      [20.18, 67.88195091],
      [20.21, 67.85],
      [20.2, 67.841],
      [20.23, 67.84037],
      [20.288, 67.826],
      [20.304, 67.8365],
      [20.303, 67.842],
      [20.315, 67.844],
      [20.35, 67.835],
      [20.37, 67.85],
      [20.3, 67.86],
      [20.18, 67.88195091]
    ]
  ]
};

export const validateArea = [
  body('points')
  .isArray()
  .withMessage('Coordinates must be an array.')
  .custom((value) => {
    if (value.length !== 1) {
      throw new Error('Coordinates must contain exactly one ring for a full polygon (no holes allowed).');
    }

    const ring = value[0];
    if (!Array.isArray(ring) || ring.length < 4) {
      throw new Error('The ring must be an array with at least 4 points to form a valid polygon.');
    }

    // [lat, long] -> [long, lat]
    const invertedRing = ring.map(point => [point[1], point[0]]);

    // Ensure the polygon is closed by checking the first and last point
    const firstPoint = invertedRing[0];
    const lastPoint = invertedRing[invertedRing.length - 1];

    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      invertedRing.push(firstPoint); // Close the polygon by adding the first point at the end
    }

    invertedRing.forEach((point, index) => {
      if (!Array.isArray(point) || point.length !== 2) {
        throw new Error(`Point ${index + 1} must be an array of two numbers.`);
      }

      const [longitude, latitude] = point;

      if (typeof longitude !== 'number' || typeof latitude !== 'number') {
        throw new Error(`Longitude and latitude of point ${index + 1} must be numbers.`);
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error(`Longitude of point ${index + 1} must be between -180 and 180.`);
      }
      if (latitude < -90 || latitude > 90) {
        throw new Error(`Latitude of point ${index + 1} must be between -90 and 90.`);
      }

      const pointGeoJSON = turf.point([longitude, latitude]);
      const kirunaGeoJSON = turf.polygon(kirunaPolygon.coordinates);
      if (!turf.booleanPointInPolygon(pointGeoJSON, kirunaGeoJSON)) {
        throw new Error(`Point ${index + 1} must be within the municipality of Kiruna.`);
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