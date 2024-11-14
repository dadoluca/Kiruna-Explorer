const SERVER_BASE_URL = 'http://localhost:5001';
const USERS_API_BASE_URL = `${SERVER_BASE_URL}/users`; 
const DOCUMENTS_API_BASE_URL = `${SERVER_BASE_URL}/documents`; 


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
    /*const response = await fetch(SERVER_URL + '/api/sessions/current', {
      credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
      throw user;  // an object with the error coming from the server
    }*/
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
  
      if (!response.ok) {
        throw new Error(`Failed to create document: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error in createDocument:", error);
      throw error;
    }
  }

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
        return await response.json();
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
  
      if (!response.ok) {
        throw new Error(`Failed to create connection: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
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

export default { logIn, logOut, getUserInfo, register, createDocument, getDocuments, getDocumentById, getAvailableDocuments, createConnection, updateDocumentCoordinates, setDocumentToMunicipality, fetchDocuments, fetchDocumentFields };