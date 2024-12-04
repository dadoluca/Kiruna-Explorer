import express from 'express';
import { validateArea } from '../validators/geolocationValidator.mjs';
import {
  createArea,
  getAllAreas,
  saveArea
} from '../controllers/geolocationController.mjs';

const router = express.Router();

router.post('/', validateArea, createArea);
router.get('/', getAllAreas);
router.post('/save', saveArea);
export default router;