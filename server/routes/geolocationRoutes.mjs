import express from 'express';
import { validateArea } from '../validators/geolocationValidator.mjs';
import {
  createArea,
  getAllAreas
} from '../controllers/geolocationController.mjs';

const router = express.Router();

router.post('/', validateArea, createArea);
router.get('/', getAllAreas);

export default router;