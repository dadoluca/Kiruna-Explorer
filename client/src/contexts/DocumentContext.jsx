import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import API from '../services/api';
import { use } from 'react';

export const DocumentContext = createContext();

export const useDocumentContext = () => useContext(DocumentContext);

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]); //all documents retrived
  const [markers, setMarkers] = useState([]); // all documents in a spot and not in an area
  const [docList, setDocList] = useState([]); // all documents displayed in the ListDocument
  const [areas, setAreas] = useState([]); // all the areas retrived
  const [displayedAreas, setDisplayedAreas] = useState([]); // all the list of documents of each area displayed in the Map
  const [municipalArea, setMunicipalArea] = useState(true); // set if municipality will be shown
  const [selectedMarker, setSelectedMarker] = useState(null); // selected marker
  const [visualizeDiagram, setVisualizeDiagram] = useState(false); // set if the diagram will be shown
  const [highlightedNode, setHighlightedNode] = useState(null); //highlighted node
  const [position, setPosition] = useState([68.1, 20.4]); // Kiruna coordinates
  const [selectedDocs, setSelectedDocs] = useState([]); // selected documents
  const [selectingMode, setSelectingMode] = useState(false);          //for the button to select more documents
  const [showUnion, setShowUnion] = useState(false);

  useEffect(() => {
    
    const fetchDocuments = async () => {
      try {
          const documents = await API.getDocuments();
          setDocuments(documents);
      } catch (error) {
          console.error("Failed to fetch documents:", error);
      }
    };

    const fetchAreas = async () => {
      try {
          const areas = await API.getAllAreas();
          setAreas(areas);
      } catch (error) {
          console.error("Failed to fetch areas:", error);
      }
    };

    fetchDocuments();
    fetchAreas();
  }, []);

  // Automatically update markers when documents change
  useEffect(() => {
    setMapMarkers(); // Default: include all documents
  }, [documents]);

  const isArea = (doc) => doc.areaId != null;
  
  const setMapMarkers = (filterFn = () => true) => {
    const validMarkers = [];
    const areasSet = new Set();
    let isMunicipalArea = false;

    let docs_copy = documents;
    docs_copy
      .filter(filterFn) // Apply the filter function to include only relevant documents
      .forEach(doc => {
        const coordinates = doc.coordinates.coordinates;
        const [longitude, latitude] = coordinates;
        
        if (doc.areaId === null) {
          isMunicipalArea = true;
        } else if (doc.areaId === undefined) {
          validMarkers.push({
            ...doc,
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude)
          });
        } else if (doc.areaId) {
          const matchingAreas = areas.filter((area) => area._id === doc.areaId);

          matchingAreas.forEach((area) => {
            if (area) {
              if (!areasSet.has(area)) {
                areasSet.add(area);
              }
            } else {
              console.log(`Found invalid area for document ${doc.title || "senza titolo"}:`, area);
            }
          });
        }
    });

    setMarkers(validMarkers);
    console.log("areasSet", areasSet);
    setDisplayedAreas(Array.from(areasSet));
    setMunicipalArea(isMunicipalArea);
  };

  const setListContent = (filterFn = () => true) => {
    const displayedDocuments = [];
    let docs_copy = documents;
    docs_copy
      .filter(filterFn) // Apply the filter function to include only relevant documents
      .forEach(doc => {
        const coordinates = doc.coordinates.coordinates;
        const [longitude, latitude] = coordinates;
        
        displayedDocuments.push({
          ...doc,
          longitude: parseFloat(longitude),
          latitude: parseFloat(latitude)
        });
    });
    
    setDocList(displayedDocuments);
  };

  const addDocument = (newDocument) => {
    setDocuments((prev) => [...prev, newDocument]);
  };

  const addArea = (newArea) => {
    setAreas((prev) => [...prev, newArea]);
  };

  const updateDocument = (updatedDocument) => {
    setDocuments((prev) => 
      prev.map(doc => 
        doc._id === updatedDocument._id ? updatedDocument : doc
      )
    );
  };

  const updateDocCoords = (documentId, newCoordinates) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc._id === documentId
          ? {
              ...doc,
              coordinates: {
                type: 'Point',
                coordinates: newCoordinates,
              },
            }
          : doc
      )
    );
  };

  const handleDocCardVisualization = (doc) => {
      if(doc == null){
          setSelectedMarker(null);
          setHighlightedNode(null);
          setMapMarkers();
      }
      else{
          let newPosition = [doc.coordinates.coordinates[1], doc.coordinates.coordinates[0]];
          setPosition(newPosition);
          setSelectedMarker({
              doc: doc,
              position: newPosition
          });
          setHighlightedNode(doc._id);
      }
  };

  const getMarker = async (id) => {
    const singleDoc = await API.getDocumentById(id);

    return singleDoc;
  }


  const checkDocumentPresence = (doc) => {        //Function to check if a document is already in the list of the selected ones
    return selectedDocs.find((d) => d._id === doc._id);
  }

   // Memoize the value object
   const value = useMemo(
    () => ({
      documents,
      markers,
      areas,
      docList,
      displayedAreas,
      municipalArea,
      selectedMarker,
      highlightedNode,
      position,
      visualizeDiagram,
      selectedDocs,
      selectingMode,
      showUnion,
      setShowUnion,
      setMapMarkers,
      addDocument,
      addArea,
      updateDocument,
      updateDocCoords,
      setListContent,
      isArea,
      handleDocCardVisualization,
      setSelectedMarker,
      setPosition,
      setVisualizeDiagram,
      setHighlightedNode,
      getMarker,
      setSelectedDocs,
      setSelectingMode,
      checkDocumentPresence
    }),
    [documents, areas, markers, docList, displayedAreas, municipalArea, selectedMarker, position, visualizeDiagram, highlightedNode, selectedDocs, selectingMode, showUnion]
  );

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};