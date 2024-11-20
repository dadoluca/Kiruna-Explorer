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

export const validateDocument = [
  body('title')
    .isString().withMessage('Title must be a string.')
    .notEmpty().withMessage('Title is required.'),
  
  body('stakeholders')
    .isArray().withMessage('Stakeholders must be an array.')
    .optional(),
  
  body('scale')
    .isString().withMessage('Scale must be a string.')
    .notEmpty().withMessage('Scale is required.'),
  
  body('issuance_date')
    .notEmpty()
    .isString()
    .matches(/^(?:\d{4}-\d{2}-\d{2}|\d{4}-\d{2}|\d{4})$/)
    .withMessage('Invalid date format. Use yyyy-mm-dd, yyyy-mm, or yyyy.'),
  
  body('type')
    .isString().withMessage('Type must be a string.')
    .notEmpty().withMessage('Type is required.'),
  
  body('connections')
    .isInt({ min: 0 }).withMessage('Connections must be a non-negative integer.')
    .notEmpty().withMessage('Connections number is required.'),
  
  body('language')
    .isString().optional(),
  
  body('pages')
    .isString().optional(),
  
  body('coordinates')
    .isObject().optional()
    .custom(value => {
      if (value) {
        if (value.type !== 'Point' || !Array.isArray(value.coordinates) || value.coordinates.length !== 2) {
          throw new Error('Coordinates must be a valid GeoJSON object.');
        }
        
        const point = turf.point(value.coordinates);
        const polygon = turf.polygon(kirunaPolygon.coordinates);
        if (!turf.booleanPointInPolygon(point, polygon)) {
          throw new Error('Coordinates must be within the municipality area of Kiruna.');
        }

        return true;
      }
      return true; // if 'coordinates' is null
  }),
  
  //body('areaId')
  //  .isMongoId().withMessage('Area ID must be a valid MongoDB Object ID.')
  //  .optional(),
  
  body('description')
    .isString().notEmpty().withMessage('Description is required.'),
  
  body('relationships')
    .isArray().withMessage('Relationships must be an array.')
    .optional()
    .custom((value) => {
      if (value) {
        value.forEach(rel => {
          if (!rel.documentId || !rel.type) {
            throw new Error('Each relationship must have a documentId and a type.');
          }
        });
      }
      return true;
  }),
  
  body('original_resources')
    .isArray().withMessage('Original resources must be an array.')
    .optional()
    .custom((value) => {
      if (value) {
        value.forEach(res => {
          if (!res.filename || !res.url || !res.type) {
            throw new Error('Each resource must have a filename, url, and type.');
          }
        });
      }
      return true;
  }),
  
  body('attachments')
    .isArray().withMessage('Attachments must be an array.')
    .optional()
    .custom((value) => {
      if (value) {
        value.forEach(att => {
          if (!att.filename || !att.url || !att.type) {
            throw new Error('Each attachment must have a filename, url, and type.');
          }
        });
      }
      return true;
  }),
  
  (req, res, next) => {
    const { coordinates, areaId } = req.body;

    if (coordinates && areaId) {
      return res.status(422).json({
        errors: [
          {
            msg: 'Only one of coordinates or areaId should be provided.',
            param: 'coordinates or areaId',
            location: 'body'
          }
        ]
      });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(422).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateCoordinates = [
  body('type')
    .isString()
    .withMessage('Type must be a string.')
    .isIn(['Point'])
    .withMessage('Type must be "Point".'),

  body('coordinates')
    .isArray()
    .withMessage('Coordinates must be an array.')
    .custom((value) => {
      if (value.length !== 2) {
        throw new Error('Coordinates array must contain exactly 2 elements.');
      }

      const [longitude, latitude] = value;

      if (typeof longitude !== 'number' || typeof latitude !== 'number') {
        throw new Error('Both longitude and latitude must be numbers.');
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180 degrees.');
      }
      if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90 degrees.');
      }

      const point = turf.point(value);
      const polygon = turf.polygon(kirunaPolygon.coordinates);
      if (!turf.booleanPointInPolygon(point, polygon)) {
        throw new Error('Coordinates must be within the municipality area of Kiruna.');
      }

      return true;
    }),

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