import Area from '../models/Geolocation.mjs';
import { centroid } from '@turf/turf';

// Create a new area
export const createArea = async (req, res) => {
  try {
    const { geojson, name } = req.body;

    // Assign a name if provided
    if (name) {
      geojson.properties.name = name;
    }

    // Calculate and assign the centroid
    const center = centroid(geojson);
    geojson.properties.centroid = center.geometry;

    // Generate a random color
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    geojson.properties.color = randomColor;

    // Save the area to the database
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
export const saveArea = async (req, res) => {
  try {
    const { points, name } = req.body;

    if (!points || !Array.isArray(points) || points.length === 0) {
      throw new Error('Points data is required.');
    }

    // Check if the polygon is closed
    const isPolygonClosed = points.every(
      ring => 
        ring.length > 3 &&
        ring[0][0] === ring[ring.length - 1][0] &&
        ring[0][1] === ring[ring.length - 1][1]
    );

    if (!isPolygonClosed) {
      throw new Error('Polygon is not closed.');
    }

    // Invert the points (lat, long) -> (long, lat)
    const invertedPoints = points.map(ring =>
      ring.map(point => [point[1], point[0]])
    );

    // Prepare the GeoJSON feature
    const areaData = {
      type: 'Feature',
      properties: name ? { name } : {},
      geometry: {
        type: 'Polygon',
        coordinates: invertedPoints,
      },
    };

    // Calculate the centroid using Turf.js
    const center = centroid(areaData);
    areaData.properties.centroid = {
      type: 'Point',
      coordinates: center.geometry.coordinates,
    };

    // Save the area in the database
    const area = new Area(areaData);
    await area.save();

    res.status(201).json(area);
  } catch (error) {
    console.error('Error saving area:', error);
    res.status(400).json({ message: error.message });
  }
};

