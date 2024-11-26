import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export const DocumentContext = createContext();

export const useDocumentContext = () => useContext(DocumentContext);

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [markers, setMarkers] = useState([]); // Array of valid markers
  const [municipalArea, setMunicipalArea] = useState([]); // Array for municipal areas documents
  const [docList, setDocList] = useState([]);
  

  const setDocumentList = (newDocuments) => {
    setDocuments(newDocuments);
  };

  // Automatically update markers when documents change
  useEffect(() => {
    setMapMarkers(); // Default: include all documents
  }, [documents]);

  
  const setMapMarkers = (filterFn = () => true) => {
    const validMarkers = [];
    const municipalDocuments = [];
    let docs_copy = documents;
    docs_copy
      .filter(filterFn) // Apply the filter function to include only relevant documents
      .forEach(doc => {
        console.log(doc);
        const coordinates = doc.coordinates.coordinates;
        const [longitude, latitude] = coordinates;
        //console.log(`Verifica coordinate per il documento ${doc.title || "senza titolo"}: [${longitude}, ${latitude}]`);

        if (doc.areaId === null) {
            municipalDocuments.push({
              ...doc,
              longitude: parseFloat(longitude),
              latitude: parseFloat(latitude)
            });
        } else {
            validMarkers.push({
                ...doc,
                longitude: parseFloat(longitude),
                latitude: parseFloat(latitude)
            });
        }
    });
    
    setMarkers(validMarkers);
    setMunicipalArea(municipalDocuments);
  };

  const setListContent = (filterFn = () => true) => {
    const displayedDocument = [];
    let docs_copy = documents;
    docs_copy
      .filter(filterFn) // Apply the filter function to include only relevant documents
      .forEach(doc => {
        console.log(doc);
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

   // Memoize the value object
   const value = useMemo(
    () => ({
      documents,
      markers,
      municipalArea,
      docList,
      setDocumentList,
      setMapMarkers,
      updateDocument,
      updateDocCoords,
      setListContent,
    }),
    [documents, markers, municipalArea, docList]
  );

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};