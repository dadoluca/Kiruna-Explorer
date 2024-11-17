import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import * as turf from '@turf/turf';

const DrawingMap = ({ onPolygonDrawn, limitArea }) => {
  const map = useMap();
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [drawControl, setDrawControl] = useState(null);
  const listenerRef = useRef(null);  // Reference to store the listener state
  const drawnItems = useRef(new L.FeatureGroup()).current;  // L.FeatureGroup to store drawn features

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

  // Handle the drawing of the polygon
  const handlePolygonDrawn = (e) => {
    const layer = e.layer;

    const latlngs = layer.getLatLngs()[0];
    if (latlngs[0].lat !== latlngs[latlngs.length - 1].lat || latlngs[0].lng !== latlngs[latlngs.length - 1].lng) {
      latlngs.push(latlngs[0]);  // Add the first point to the end to close the polygon
    }

    const drawnPolygon = turf.polygon([latlngs.map(latlng => [latlng.lng, latlng.lat])]);

    const limitPolygon = turf.polygon([limitArea.map(latlng => [latlng[1], latlng[0]])]);

    // Check if the drawn polygon is within the limit area
    if (turf.booleanWithin(drawnPolygon, limitPolygon)) {
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);
      setDrawnPolygon(layer);
      console.log('Polygon drawn within the limit area:', layer.getLatLngs());
    } else {
      drawnItems.clearLayers();
      setDrawnPolygon(null);
      alert('The drawn polygon is outside the allowed limit area. Please draw within the designated area.');
      console.log('Polygon outside the limit area.');
    }
  };

  // Handle the editing of the polygon
  const handlePolygonEdited = (e) => {
    const layers = e.layers;

    layers.eachLayer((layer) => {
      const latlngs = layer.getLatLngs()[0];
      if (latlngs[0].lat !== latlngs[latlngs.length - 1].lat || latlngs[0].lng !== latlngs[latlngs.length - 1].lng) {
        latlngs.push(latlngs[0]);  // Add the first point to the end to close the polygon
      }

      const drawnPolygon = turf.polygon([latlngs.map(latlng => [latlng.lng, latlng.lat])]);

      const limitPolygon = turf.polygon([limitArea.map(latlng => [latlng[1], latlng[0]])]);

      // Check if the edited polygon is within the limit area
      if (turf.booleanWithin(drawnPolygon, limitPolygon)) {
        setDrawnPolygon(layer);
        console.log('Polygon edited within the limit area:', layer.getLatLngs());
      } else {
        drawnItems.removeLayer(layer);
        setDrawnPolygon(null);
        alert('The edited polygon is outside the allowed limit area. Please draw within the designated area.');
        console.log('Polygon outside the limit area after editing.');
      }
    });
  };

  useEffect(() => {
    if (drawingEnabled && drawControl) {
      map.addControl(drawControl);
      drawPolygon();
    } else if (drawControl) {
      map.removeControl(drawControl);
    }
  }, [drawingEnabled, drawControl, map]);

  const drawPolygon = () => {
    const polygonHandler = drawControl._toolbars.draw._modes.polygon.handler;
    polygonHandler.enable(); // Enable the polygon drawing mode
  };

  const toggleDrawing = () => {
    setDrawingEnabled((prev) => !prev);
  };

  const handleSendPolygon = () => {
    if (drawnPolygon) {
      onPolygonDrawn(drawnPolygon);
    }
  };

  return (
    <div>
      <button onClick={toggleDrawing}>
        {drawingEnabled ? 'Disable Drawing' : 'Enable Polygon Drawing'}
      </button>
      <button onClick={handleSendPolygon} disabled={!drawnPolygon}>
        Send Polygon
      </button>
    </div>
  );
};

export default DrawingMap;