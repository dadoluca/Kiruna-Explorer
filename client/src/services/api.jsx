const SERVER_BASE_URL = 'http://localhost:5001';
const API_BASE_URL = `${SERVER_BASE_URL}/api`; 


export async function createDocument(document) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/documents`, {
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