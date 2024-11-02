import express from 'express';
import { connectDB } from './config/db.mjs';
import { validateDocument } from './validators/documentValidator.mjs';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();


// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Route Imports
import documentRoutes from './routes/documentRoutes.mjs';
//import resourceRoutes from './routes/resourceRoutes.mjs';
//import linkRoutes from './routes/linkRoutes.mjs';
//import geolocationRoutes from './routes/geolocationRoutes.mjs';
import userRoutes from './routes/userRoutes.mjs';

// Use Routes
app.use('/documents', validateDocument, documentRoutes);
//app.use('/resources', resourceRoutes);
//app.use('/links', linkRoutes);
//app.use('/geolocations', geolocationRoutes);
app.use('/users', userRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
