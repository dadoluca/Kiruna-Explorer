const SERVER_BASE_URL = 'http://localhost:5001';
const USERS_API_BASE_URL = `${SERVER_BASE_URL}/users`; 
const DOCUMENTS_API_BASE_URL = `${SERVER_BASE_URL}/documents`;
const AREAS_API_BASE_URL = `${SERVER_BASE_URL}/areas`; 

const logIn = async (credentials) => {
    const response = await fetch(USERS_API_BASE_URL + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    
    if(response.ok) {
      const user = await response.json();
      return user;
    }
    else {
      const errDetails = await response.text();
      throw errDetails;
    }
};

const logOut = async() => {
  const response = await fetch(USERS_API_BASE_URL + '/logout', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}
  
const getUserInfo = async () => {
   throw new Error('Not authenticated');
};

const register = async (newUser) => {
  const response = await fetch(USERS_API_BASE_URL + '/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newUser),
  });

  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetails = await response.text();
    throw errDetails;
  }
};
  

const createDocument = async (document) => {
  try {
    const response = await fetch(`${DOCUMENTS_API_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(document),
    });

    if (response.ok) {
      // Parse and enhance the document data
      const responseData = await response.json();
      return {
        ...responseData,
        icon: `${SERVER_BASE_URL}${responseData.icon_url}`,
      };
    } else {
      // Throw an error with the status text
      throw new Error(`Failed to create document: ${response.statusText}`);
    }
  } catch (error) {
    // Log and rethrow the error
    console.error("Error in createDocument:", error);
    throw error;
  }
};


  // Returns a list of documents
  // Optional filters example: { title: "Example Document", issuance_date: "2023-10-12" }
  const getDocuments = async (filters = {}) => {
    try {
      const url = new URL(DOCUMENTS_API_BASE_URL);
      Object.keys(filters).forEach(key => url.searchParams.append(key, filters[key]));
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        let data = await response.json();
        data = data.data.map(doc => ({
          ...doc,
          icon: `${SERVER_BASE_URL}${doc.icon_url}`,
        }));  
        return data; // List of documents
      } else {
        throw new Error(`Failed to retrieve documents: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error in getDocuments:", error);
      throw error;
    }
  };

  const getDocumentById = async (documentId) => {
    try {
      const response = await fetch(`${DOCUMENTS_API_BASE_URL}/${documentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        throw new Error('Document not found');
      } else {
        throw new Error(`Failed to retrieve document: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error in getDocumentById:", error);
      throw error;
    }
  };

  const getAvailableDocuments = async (documentId) => {
    try {
      const response = await fetch(`${DOCUMENTS_API_BASE_URL}/${documentId}/available`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching available documents:", error);
      throw error;
    }
  }
  const createConnection = async ({ documentId, newDocumentId, type, title }) => {
    try {
      const response = await fetch(`${DOCUMENTS_API_BASE_URL}/${documentId}/relationships`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId: newDocumentId, type, title }),
      });
      
      if (response.ok) {
        // Parse and enhance the response document
        const responseData = await response.json();

        const enhancedDocument1 = {
          ...responseData.document1,
          icon: `${SERVER_BASE_URL}${responseData.document1.icon_url}`,
        };
  
        const enhancedDocument2 = {
          ...responseData.document2,
          icon: `${SERVER_BASE_URL}${responseData.document2.icon_url}`,
        };

        return {
          ...responseData,
          document1: enhancedDocument1,
          document2: enhancedDocument2,
        };
      } else {
        // Throw an error with the response status
        throw new Error(`Failed to create connection: ${response.statusText}`);
      }
    } catch (error) {
      // Log and rethrow the error
      console.error("Error in createConnection:", error);
      throw error;
    }
  };
  

  // type should be 'Point'
  const updateDocumentCoordinates = async (documentId, type, coordinates) => {
    try {
      const response = await fetch(`${DOCUMENTS_API_BASE_URL}/${documentId}/coordinates`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, coordinates })
      });
      if (!response.ok) {
        throw new Error(`Failed to update coordinates: ${response.statusText}`);
      }
      const updatedDocument = await response.json();
      return updatedDocument;
    } catch (error) {
      console.error("Error updating coordinates:", error);
      throw error;
    }
  }
  
  const setDocumentToMunicipality = async (documentId) => {
    try {
      const response = await fetch(`${DOCUMENTS_API_BASE_URL}/${documentId}/municipality`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to clear areaId: ${response.statusText}`);
      }
      const updatedDocument = await response.json();
      return updatedDocument;
    } catch (error) {
      console.error("Error setting municipality area:", error);
      throw error;
    }
  }

  // Fetch documents with pagination, sorting, and filtering
  const fetchDocuments = async (page, limit, sortBy, order, filter) => {
    const url = new URL(`${DOCUMENTS_API_BASE_URL}/fetch/pagination`, window.location.origin);

    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    url.searchParams.append('sortBy', sortBy);
    url.searchParams.append('order', order);
    if (filter) url.searchParams.append('filter', filter);
  
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }
  
  // Fetch documents' titles and dates, sorted by title
  const fetchDocumentFields = async () => {
    try {
      const response = await fetch(`${DOCUMENTS_API_BASE_URL}/fetch/fields`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch document fields');
      }
      const fields = await response.json();
      return fields;
    } catch (error) {
      console.error('Error fetching document fields:', error);
    }
  }

  const createArea = async (geojson, name = null) => {
    try {
      const payload = {
        geojson,
        ...(name && { name }),
      };
  
      const response = await fetch(`${AREAS_API_BASE_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create area: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error in createArea:", error);
      throw error;
    }
  };

  const getAllAreas = async () => {
    try {
      const response = await fetch(`${AREAS_API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to retrieve areas: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error in getAllAreas:", error);
      throw error;
    }
  };

  //Resources APIs
  const getResources = async (documentId) => {
    try {
      const response = await fetch(`${DOCUMENTS_API_BASE_URL}/${documentId}/resources`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      const resources = await response.json();
      return resources;
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }

  const addResources = async(documentId, files) => {
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
      }
      const response = await fetch(`${DOCUMENTS_API_BASE_URL}/${documentId}/resources`, {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        throw new Error('Failed to add resources');
      }
    } catch (error) {
      console.error('Error adding resources:', error);
    }
}

const downloadResource = async (documentId, filename) => {
  try {
    const response = await fetch(`${DOCUMENTS_API_BASE_URL}/${documentId}/resources/${filename}/download`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
    if (!response.ok) {
      throw new Error('Failed to download resource');
    }
    return response.blob();
  } catch (error) {
    console.error('Error downloading resource:', error);
  }
}

const setDocumentDiagramPosition = async (documentId, diagramX, diagramY) => {
  try {
    const response = await fetch(`${DOCUMENTS_API_BASE_URL}/${documentId}/diagram-position`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        diagramX,
        diagramY
      })
    });

    if (response.ok) {
      const updatedDocument = await response.json();
      return {
        ...updatedDocument,
        icon: `${SERVER_BASE_URL}${updatedDocument.icon_url}`,
      };
    } else {
      throw new Error(`Failed to update document position: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error updating document position:", error);
    throw error;
  }
};

export default { logIn, logOut, getUserInfo, register, createDocument, getDocuments, getDocumentById, getAvailableDocuments, createConnection, updateDocumentCoordinates, setDocumentToMunicipality, fetchDocuments, fetchDocumentFields, getResources, addResources, downloadResource, createArea, getAllAreas, setDocumentDiagramPosition };
