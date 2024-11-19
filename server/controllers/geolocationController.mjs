import Area from '../models/Geolocation.mjs';

// Create a new area
export const createArea = async (req, res) => {
  try {
    const { points, name } = req.body;

    // Invert the points (lat, long) -> (long, lat)
    const invertedPoints = points.map(ring => 
      ring.map(point => [point[1], point[0]]) // [lat, long] -> [long, lat]
    );

    // Ensure the polygon is closed by adding the first point at the end
    invertedPoints.forEach(ring => {
      if (ring[0] !== ring[ring.length - 1]) {
        ring.push(ring[0]); // Add the first point to the end of the ring
      }
    });

    const areaData = {
      type: 'Feature',
      properties: name ? { name } : {}, // Add name only if provided
      geometry: {
        type: 'Polygon',
        coordinates: invertedPoints, // Using the inverted points with closure
      },
    };

    const area = new Area(areaData);
    await area.save();

    res.status(201).json(area);
  } catch (error) {
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