import express from 'express';
import { renderVisualizationData } from '../controllers/visualizationController.mjs';

const router = express.Router();

// Route to fetch and render visualization data
router.get('/visualization', renderVisualizationData);

export default router;
