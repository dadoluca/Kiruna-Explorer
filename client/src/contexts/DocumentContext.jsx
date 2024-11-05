import React, { createContext, useContext, useState } from 'react';

export const DocumentContext = createContext();

export const useDocumentContext = () => useContext(DocumentContext);

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);

  const setDocumentList = (newDocuments) => {
    setDocuments(newDocuments);
  };

  const updateDocument = (updatedDocument) => {
    setDocuments((prev) => 
      prev.map(doc => 
        doc._id === updatedDocument._id ? updatedDocument : doc
      )
    );
  };

  return (
    <DocumentContext.Provider value={{ documents, setDocumentList, updateDocument }}>
      {children}
    </DocumentContext.Provider>
  );
};