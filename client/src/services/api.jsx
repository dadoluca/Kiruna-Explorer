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

  const getDocuments = async () => {
    try {
      const response = await fetch(`${DOCUMENTS_API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        let data = await response.json();
        data = data.map(doc => ({
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
      console.error(error);
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
      console.error(error);
      throw error;
    }
  }
  

export default { logIn, logOut, getUserInfo, register, createDocument, getDocuments, getAvailableDocuments, createConnection, updateDocumentCoordinates, setDocumentToMunicipality };