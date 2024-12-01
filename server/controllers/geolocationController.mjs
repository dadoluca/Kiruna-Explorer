import Area from '../models/Geolocation.mjs';
import { centroid } from '@turf/turf';

// Create a new area
export const createArea = async (req, res) => {
  try {
    const { geojson, name } = req.body;

    if (name) {
      geojson.properties.name = name;
    }

    const center = centroid(geojson);

    geojson.properties.centroid = center.geometry;

    const area = new Area(geojson);
    await area.save();

    res.status(201).json(area);
  } catch (error) {
    console.error('Error creating area:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all areas
export const getAllAreas = async (req, res) => {
  try {
    const areas = await Area.find();
    res.status(200).json(areas);
  } catch (error) {
    console.error('Error fetching areas:', error);
    res.status(500).json({ message: 'Failed to fetch areas.', error: error.message });
  }
};