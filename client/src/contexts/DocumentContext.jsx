import React, { createContext, useContext, useState, useEffect } from 'react';

export const DocumentContext = createContext();

export const useDocumentContext = () => useContext(DocumentContext);

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [markers, setMarkers] = useState([]); // Array of valid markers
  const [municipalArea, setMunicipalArea] = useState([]); // Array for municipal areas documents
  

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
        const coordinates = doc.coordinates?.coordinates || null;
        const [longitude, latitude] = coordinates || [];
        //console.log(`Verifica coordinate per il documento ${doc.title || "senza titolo"}: [${longitude}, ${latitude}]`);

        if (!coordinates || longitude == null || latitude == null) {
            municipalDocuments.push(doc);
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

  const updateDocument = (updatedDocument) => {
    setDocuments((prev) => 
      prev.map(doc => 
        doc._id === updatedDocument._id ? updatedDocument : doc
      )
    );
  };


  return (
    <DocumentContext.Provider value={{ documents, markers, municipalArea, setDocumentList, setMapMarkers, updateDocument }}>
      {children}
    </DocumentContext.Provider>
  );
};