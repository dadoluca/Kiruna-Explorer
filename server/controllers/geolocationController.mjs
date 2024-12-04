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
export const saveArea = async (req, res) => {
  try {
    const { points, name } = req.body;

    // Invert the points (lat, long) -> (long, lat)
    const invertedPoints = points.map(ring => 
      ring.map(point => [point[1], point[0]]) // [lat, long] -> [long, lat]
    );

    // Ensure the polygon is closed by adding the first point at the end
    invertedPoints.forEach(ring => {
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
        ring.push(ring[0]); // Add the first point to the end of the ring to close the polygon
      }
    });

    // Prepare the GeoJSON feature
    const areaData = {
      type: 'Feature',
      properties: name ? { name } : {}, // Add name only if provided
      geometry: {
        type: 'Polygon',
        coordinates: invertedPoints, // Using the inverted points with closure
      },
    };

    // Calculate the centroid using Turf.js
    const center = centroid(areaData);

    // Add the centroid to the properties
    areaData.properties.centroid = {
      type:'Point',
      coordinates: center.geometry.coordinates
    }
    // Save the area in the database
    const area = new Area(areaData);
    await area.save();

    res.status(201).json(area);
  } catch (error) {
    console.error('Error saving area:', error);
    res.status(400).json({ message: error.message });
  }
};