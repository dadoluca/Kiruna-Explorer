import express from 'express';
import { connectDB } from './config/db.mjs';
import dotenv from 'dotenv';
import cors from 'cors';
import documentRoutes from './routes/documentRoutes.mjs';
import userRoutes from './routes/userRoutes.mjs';
import geolocationRoutes from './routes/geolocationRoutes.mjs';
import visualizationRoutes from './routes/visualizationRoutes.mjs';  // Import new visualization routes
import { errorHandler } from './middleware/errorMiddleware.mjs';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS with your frontend
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Routes
app.use('/documents', documentRoutes);
app.use('/users', userRoutes);
app.use('/areas', geolocationRoutes);
app.use('/api', visualizationRoutes);  // Add the new route for visualization


// Error handling middleware
app.use((err, req, res, next) => {
  if (err.statusCode) {
    // Known error with custom status code (e.g., 404, 422, 500)
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  // Unknown errors default to 500
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});


// To serve static files (e.g., icon images)
app.use(express.static('public'));

export default app;
