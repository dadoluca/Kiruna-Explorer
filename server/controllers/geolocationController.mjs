import Area from '../models/Geolocation.mjs';
import { centroid } from '@turf/turf';
import crypto from 'crypto';

// Manually validate GeoJSON
const isValidGeoJSON = (geojson) => {
  console.log("GeoJSON Data Received:", geojson);

  // Check if geojson is present and of type 'Feature'
  if (!geojson || geojson.type !== 'Feature') {
    console.log('Invalid GeoJSON type:', geojson?.type);
    return false;
  }

  // Ensure geometry exists and is of type 'Polygon'
  if (!geojson.geometry || geojson.geometry.type !== 'Polygon') {
    console.log('Invalid geometry type:', geojson?.geometry?.type);
    return false;
  }

  // Ensure coordinates exist and are an array
  if (!Array.isArray(geojson.geometry.coordinates)) {
    console.log('Coordinates missing or invalid:', geojson?.geometry?.coordinates);
    return false;
  }

  // Ensure each ring has at least 4 points and is closed (first and last points match)
  const coordinates = geojson.geometry.coordinates;
  return coordinates.every(ring => 
    ring.length > 3 && 
    ring[0][0] === ring[ring.length - 1][0] && 
    ring[0][1] === ring[ring.length - 1][1]
  );
};

// Generate a secure random color
const generateSecureRandomColor = () => {
  const randomBytes = crypto.randomBytes(3); // Generate 3 random bytes
  return `#${randomBytes.toString('hex')}`; // Convert to hexadecimal
};

// Create a new area
export const createArea = async (req, res) => {
  try {
    const { geojson, name } = req.body;

    // Check if geojson is provided
    if (!geojson) {
      throw new Error('GeoJSON data is required.');
    }

    // Manually validate GeoJSON
    if (!isValidGeoJSON(geojson)) {
      throw new Error('Invalid GeoJSON data. Ensure it conforms to the Feature schema.');
    }

    // Assign a name to the geojson properties if provided
    if (name) {
      geojson.properties.name = name;
    }

    // Check if geometry is defined
    if (!geojson.geometry || !geojson.geometry.coordinates) {
      throw new Error('Invalid geometry: Coordinates are missing or malformed.');
    }

    // Calculate and assign the centroid to the geojson properties
    const center = centroid(geojson);
    geojson.properties.centroid = {
      type: 'Point',
      coordinates: center.geometry.coordinates, // Ensure it follows the [longitude, latitude] format
    };

    // Validate centroid coordinates
    if (geojson.properties.centroid.coordinates.length !== 2) {
      throw new Error('Centroid coordinates must be an array of two numbers [longitude, latitude].');
    }

    // Generate a secure random color and assign it to the geojson properties
    geojson.properties.color = generateSecureRandomColor();

    // Save the area to the database
    const area = new Area({
      type: geojson.type,
      properties: geojson.properties,
      geometry: geojson.geometry,
    });

    await area.save();

    // Send a success response with the newly created area
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

// Save area (with points and inverted coordinates)
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
