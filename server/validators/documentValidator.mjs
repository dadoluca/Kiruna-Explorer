import { body, validationResult } from 'express-validator';

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
    .matches(/^(?:\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{4}|\d{4})$/) // dd/mm/yyyy, mm/yyyy, yyyy
    .withMessage('Invalid date format. Use dd/mm/yyyy, mm/yyyy, or yyyy.'),
  
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
        return true;
      }
      return true; // if 'coordinates' is null
    }),
  
  body('areaId')
    .isMongoId().withMessage('Area ID must be a valid MongoDB Object ID.')
    .optional(),
  
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
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }
];