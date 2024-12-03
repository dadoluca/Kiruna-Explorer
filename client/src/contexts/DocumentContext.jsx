import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import API from '../services/api';

export const DocumentContext = createContext();

export const useDocumentContext = () => useContext(DocumentContext);

export const DocumentProvider = ({ children }) => {

  const [documents, setDocuments] = useState([]); //all documents retrived
  const [markers, setMarkers] = useState([]); // all documents in a spot and not in an area
  const [docList, setDocList] = useState([]); // all documents displayed in the ListDocument
  const [areas, setAreas] = useState([]); // all the areas retrived
  const [displayedAreas, setDisplayedAreas] = useState([]); // all the list of documents of each area displayed in the Map
  const [municipalArea, setMunicipalArea] = useState(true); // set if municipality will be shown
  
  const [linksAdded, setLinksAdded] = useState(0);
  
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

  const visualizeDocumentfromDiagram = (doc) =>{
    //TO DO NEXT SPRINT IN ORDER TO VISUALIZE DOCUMENT WHEN IT'S CLICKED IN THE DIAGRAM 
  }

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
        //console.log(`Verifica coordinate per il documento ${doc.title || "senza titolo"}: [${longitude}, ${latitude}]`);
       
        if (doc.areaId === null) {
          isMunicipalArea = true;
        } else if (doc.areaId === undefined) {
          validMarkers.push({
            ...doc,
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude)
          });
        } else if (doc.areaId) {
          areasSet.add(areas.filter((area) => area._id === doc.areaId));
        }
    });

    setMarkers(validMarkers);
    setDisplayedAreas(Array.from(areasSet));
    setMunicipalArea(isMunicipalArea);
  };

  const setListContent = (filterFn = () => true) => {
    const displayedDocument = [];
    let docs_copy = documents;
    docs_copy
      .filter(filterFn) // Apply the filter function to include only relevant documents
      .forEach(doc => {
        const coordinates = doc.coordinates.coordinates;
        const [longitude, latitude] = coordinates;
        //console.log(`Verifica coordinate per il documento ${doc.title || "senza titolo"}: [${longitude}, ${latitude}]`);

        displayedDocument.push({
          ...doc,
          longitude: parseFloat(longitude),
          latitude: parseFloat(latitude)
        });
    });
    
    setDocList(displayedDocument);
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

  const addNewLink = () => {
    let newV = linksAdded + 1;

    setLinksAdded(newV);
    console.log("AGGIORNATO!!", linksAdded);
  }

  const getNumLinks = () => {
    return linksAdded;
  }

   // Memoize the value object
   const value = useMemo(
    () => ({
      documents,
      markers,
      linksAdded,
      areas,
      docList,
      displayedAreas,
      municipalArea,
      setMapMarkers,
      updateDocument,
      updateDocCoords,
      setListContent,
      addNewLink,
      getNumLinks,

      isArea
    }),
    [documents, markers,docList, linksAdded]
  );

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};