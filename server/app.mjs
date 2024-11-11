import express from 'express';
import { connectDB } from './config/db.mjs';
import dotenv from 'dotenv';
import cors from 'cors';
import documentRoutes from './routes/documentRoutes.mjs';
import userRoutes from './routes/userRoutes.mjs';
import { errorHandler } from './middleware/errorMiddleware.mjs';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/documents', documentRoutes);
app.use('/users', userRoutes);

// Error Handling Middleware - should be added after all routes
app.use(errorHandler);

export default app;