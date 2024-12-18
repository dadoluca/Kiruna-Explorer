import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import * as turf from '@turf/turf';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DrawingMap = ({ onPolygonDrawn, limitArea, EnableDrawing, confirmSelectedArea }) => {
  const map = useMap();
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [drawControl, setDrawControl] = useState(null);
  const listenerRef = useRef(null);  // Reference to store the listener state
  const drawnItems = useRef(new L.FeatureGroup()).current;  // L.FeatureGroup to store drawn features
  const previousPolygonRef = useRef(null);  // Reference to store the previous valid polygon

  useEffect(() => {
    // Add the drawnItems layer to the map
    map.addLayer(drawnItems);
    const control = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
    });
    setDrawControl(control);

    // Add the drawing control to the map only if the listeners haven't been added yet
    if (!listenerRef.current) {
      listenerRef.current = true;  // Mark that the listeners have been added
      map.on(L.Draw.Event.CREATED, handlePolygonDrawn);
      map.on(L.Draw.Event.EDITED, handlePolygonEdited);
    }
    map.addControl(control);

    // Cleanup function to remove the listeners and drawing control
    return () => {
      map.removeLayer(drawnItems);
      map.off(L.Draw.Event.CREATED, handlePolygonDrawn); // Remove the 'CREATED' listener
      map.off(L.Draw.Event.EDITED, handlePolygonEdited); // Remove the 'EDITED' listener
      map.removeControl(control); // Remove the drawing control
      listenerRef.current = null;  // Reset the listener state
    };
  }, [map, limitArea]);  // The listener is added only once

  // Common logic to validate and update polygons
  const validateAndUpdatePolygon = (latlngs, layer) => {
    if (latlngs[0].lat !== latlngs[latlngs.length - 1].lat || latlngs[0].lng !== latlngs[latlngs.length - 1].lng) {
      latlngs.push(latlngs[0]);  // Add the first point to the end to close the polygon
    }
    const polygon = turf.polygon([latlngs.map(latlng => [latlng.lng, latlng.lat])]);

    // Convert limitArea to a MultiPolygon if it is an array of polygons
    const limitPolygon = Array.isArray(limitArea[0])
      ? turf.multiPolygon([limitArea.map(latlng => latlng.map(point => [point[1], point[0]]))])
      : turf.polygon([limitArea.map(latlng => [latlng[1], latlng[0]])]);

    // Check if the drawn polygon is within the limit area (either MultiPolygon or Polygon)
    const isInside = turf.booleanWithin(polygon, limitPolygon);
    if (isInside) {
      previousPolygonRef.current = polygon;  // Store the valid polygon
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);
      setDrawnPolygon(layer);
      console.log('Polygon drawn/edited within the limit area:', layer.toGeoJSON());
    } else {
      drawnItems.removeLayer(layer);
      if (previousPolygonRef.current) {
        // Restore the previous valid polygon
        const prevLayer = L.polygon(previousPolygonRef.current.geometry.coordinates[0].map(coord => [coord[1], coord[0]]));
        drawnItems.addLayer(prevLayer);
        setDrawnPolygon(prevLayer);
      }
      toast.error('The drawn area is outside the municipality area.');
      console.log('Polygon outside the limit area.');
    }
  };

  // Handle the drawing of the polygon
  const handlePolygonDrawn = (e) => {
    const layer = e.layer;
    const latlngs = layer.getLatLngs()[0];
    validateAndUpdatePolygon(latlngs, layer);
  };

  // Handle the editing of the polygon
  const handlePolygonEdited = (e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      const latlngs = layer.getLatLngs()[0];
      validateAndUpdatePolygon(latlngs, layer);
    });
  };

  useEffect(() => {
    if (EnableDrawing && drawControl) {
      map.addControl(drawControl);
      drawPolygon();
    } else if (drawControl) {
      map.removeControl(drawControl);
    }
  }, [EnableDrawing, drawControl, map]);

  const drawPolygon = () => {
    const polygonHandler = drawControl._toolbars.draw._modes.polygon.handler;
    polygonHandler.enable(); // Enable the polygon drawing mode
  };

  useEffect(()=> {
    if (drawnPolygon!==null && confirmSelectedArea===true){
      onPolygonDrawn(drawnPolygon);
      setDrawnPolygon(null);
    }
  }, [confirmSelectedArea]);
};

export default DrawingMap;