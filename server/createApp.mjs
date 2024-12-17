// server/createApp.mjs
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.mjs';
import documentRoutes from './routes/documentRoutes.mjs';
import { errorHandler } from './middleware/errorMiddleware.mjs';  
import areaRoutes from './routes/geolocationRoutes.mjs';
import { loginUser, updateUserProfile } from './controllers/userController.mjs';

dotenv.config();

export const createApp = () => {
  const app = express();
  app.use(express.json());

  // Register your routes
  app.use('/users', userRoutes);
  app.use('/documents', documentRoutes);
  app.use('/api/areas', areaRoutes);
  app.use(errorHandler);

  return app;
};
