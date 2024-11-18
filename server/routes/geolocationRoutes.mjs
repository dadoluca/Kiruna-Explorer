import express from 'express';
// import {  } from '../validators/.mjs';
import { 
  getAllAreas
} from '../controllers/geolocationController.mjs';

const router = express.Router();

router.get('/', getAllAreas);

export default router;