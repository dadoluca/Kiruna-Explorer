import Area from '../models/Geolocation.mjs';

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