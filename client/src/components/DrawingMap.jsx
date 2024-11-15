import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

const DrawingMap = ({ onPolygonDrawn }) => {
    const map = useMap();
    const [drawingEnabled, setDrawingEnabled] = useState(false);
    const [drawnPolygon, setDrawnPolygon] = useState(null);
  
    useEffect(() => {
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
  
      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems
        },
        draw: {
          polygon: true,
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false
        }
      });
  
      if (drawingEnabled) {
        map.addControl(drawControl);
      } else {
        map.removeControl(drawControl);
      }
  
      map.on(L.Draw.Event.CREATED, (e) => {
        const layer = e.layer;
        drawnItems.clearLayers(); // Rimuovi il poligono precedente
        drawnItems.addLayer(layer);
        setDrawnPolygon(layer);
        console.log("Poligono disegnato:", layer.getLatLngs());
      });
  
      map.on(L.Draw.Event.EDITED, (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
          setDrawnPolygon(layer);
          console.log("Poligono modificato:", layer.getLatLngs());
        });
      });
  
      return () => {
        map.removeControl(drawControl);
        map.removeLayer(drawnItems);
      };
    }, [map, drawingEnabled]);
  
    const toggleDrawing = () => {
      setDrawingEnabled((prev) => !prev);
    };
  
    const handleSendPolygon = () => {
      if (drawnPolygon) {
        // Passa il poligono disegnato al componente padre
        onPolygonDrawn(drawnPolygon);
      }
    };
  
    return (
      <div>
        <button onClick={toggleDrawing}>
          {drawingEnabled ? 'Disabilita Disegno' : 'Abilita Disegno Poligono'}
        </button>
        <button onClick={handleSendPolygon} disabled={!drawnPolygon}>
          Invia Poligono
        </button>
      </div>
    );
  };
  
  export default DrawingMap;