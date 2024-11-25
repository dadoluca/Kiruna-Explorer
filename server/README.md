# Express Backend for Kiruna eXplorer



## Instructions to Run

After pulling the latest code, follow these steps to set up and run the server:

1. **Install Dependencies**:
   - Run the following command to install all required dependencies:
     ```bash
     npm install
     ```

2. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory (if it doesn’t already exist).
   - Add the following environment variables:
     ```plaintext
     MONGO_URI=<your_mongodb_connection_string>
     JWT_SECRET=<your_jwt_secret_key>
     ```
   - Replace `<your_mongodb_connection_string>` with your MongoDB connection URI and `<your_jwt_secret_key>` with a secret key for JWT token signing.

3. **Start MongoDB** (if it’s not already running):
   - Ensure that MongoDB is running locally or accessible via the connection string provided in the `.env` file.

4. **Run the Server**:
   - Start the server in development mode using:
     ```bash
     node server.mjs
     ```
   - This command uses `nodemon` to automatically restart the server on file changes.

5. **Access the API**:
   - The server should now be running on `http://localhost:5001`, and the API endpoints are accessible via this base URL.
   - Use tools like **Postman** to test the API endpoints.

Your server is now set up and ready to use!

## Database `MongoDB`

### 1. **Documents Collection**

The `documents` collection contains all documents.

## Docker Setup and Running Instructions

### Description
This project is containerized using Docker to streamline the development and deployment processes. It includes services for the backend, frontend, and MongoDB database. Docker Compose is used to manage multiple containers efficiently.

### Prerequisites
- Ensure Docker is installed on your system. [Docker Installation Guide](https://docs.docker.com/get-docker/)
- Ensure Docker Compose is installed. [Docker Compose Installation Guide](https://docs.docker.com/compose/install/)

### File Structure
The repository contains the following key files for Docker:
- **`docker-compose.yml`**: Defines the services for the project.
- **`Dockerfile`**: Separate Dockerfiles for the backend and frontend services.

### Steps to Run the Application

1. **Build and Start Containers**
   Run the following command to build and start all services (frontend, backend, and MongoDB):
   ```bash
   docker-compose up --build


#### Document Structure

- **_id**: Unique identifier for each document.
- **title**: (String) The document title.
- **stakeholders**: (Array) List of organizations or entities involved in the document (e.g. ["LKAB", "Kiruna kommun"]).
- **scale**: (String) It is the relationship between the dimensions drawn on a plan or architectural drawing and the actual dimensions of the building (e.g. "1 : 1,000" or "blueprints/effects").
- **issuance_date**: (String) Date the document was issued. Valid formats: `"yyyy-mm-dd"`, `"yyyy-mm"`, `"yyyy"`
- **type**: (String) The document type (e.g. "Prescriptive document" or "Material effect").
- **connections**: (Number) The number of connections this document has to others.
- **language**: (String) Language of the document content. Can be empty.
- **pages**: (String) Pages number or range within the document (e.g. "10" or "1-43"). Can be empty.
- _only one of the following can be defined:_
    - **coordinates**: (GeoJSON Object) Represents the document’s geographic location:
        - **type**: (String) Geometry type (e.g. `"Point"`).
        - **coordinates**: (Array) Coordinates in GeoJSON format for the document location.
    - **areaId**: Reference to an `_id` in the `areas` collection, indicating the area associated with the document.
- **description**: (String) Description of the document’s content.
- **relationships**: (Array) Documents related to this one, with each entry containing:
  - **documentId**: Reference to another document’s `_id`.
  - **documentTitle**: (String) Other document's title.
  - **type**: (String) Link type (one of the following: `"direct consequence"`, `"collateral consequence"`, `"projection"`, `"update"`).
- **original_resources**: (Array) List of downloadable files related to this document, with each entry containing:
  - **filename**: (String) Name of the downloadable file.
  - **url**: (String) Path of the downloadable file.
  - **type**: (String) File extention (e.g. "pdf" or "docx").
- **attachments**: (Same format of `original_resources`) Any additional documentation provided to better understand the original documents may include photos, videos, or any other type of file.

#### Example Document

```json
{
  "_id": {
    "$oid": "6720e8d43c709bcd6d6af8a5"
  },
  "title": "Detail plan for square and commercial street (50)",
  "stakeholders": [
    "Kiruna kommun"
  ],
  "scale": "1 : 1,000",
  "issuance_date": "2016-06-22",
  "type": "Prescriptive document",
  "connections": 7,
  "language": "Swedish",
  "pages": "1-43",
  "coordinates": {
    "type": "Point",
    "coordinates": [20.30033, 67.84856]
  },
  "description": "This plan, approved in July 2016, is the first detailed plan to be implemented...",
  "relationships": [
    {
      "documentId": {
        "$oid": "671cba50d4e8ac2db4ad8342"
      },
      "documentTitle": "Sample title",
      "type": "direct consequence",
    },
    ...
  ],
  "original_resources": [
    {
      "filename": "resource.pdf",
      "url": "/public/resource.pdf",
      "type": "pdf"
    },
    ...
  ],
  "attachments": [
    {
      "filename": "attachment.pdf",
      "url": "/public/attachment.pdf",
      "type": "pdf"
    },
    ...
  ]
}
```

### 2. **Areas Collection**

The `areas` collection defines various areas within the city. Each area can contain one or more documents.

#### Area Structure

- **_id**: Unique identifier for each area.
- **GeoJSON**:
    - **name**: (String) The name of the area.
    - **coordinates**: (Array) Stores coordinates representing the polygon vertices in GeoJSON format.

#### Example Area

```json
{
  "_id": {
    "$oid": "67210139d9ffe8c49a518966"
  },
  "type": "Feature",
  "properties": {
    "name": "the entire municipality of Kiruna"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [
          20.12,
          67.875
        ],
        [
          20.42,
          67.875
        ],
        [
          20.42,
          67.79
        ],
        [
          20.12,
          67.79
        ],
        [
          20.12,
          67.875
        ]
      ]
    ]
  }
}
```

### 2. **Users Collection**

The `users` collection contains all registered users.

#### User Structure

- **_id**: Unique identifier for each user.
- **name**: (String) Name of the user.
- **email**: (String) Email of the user.
- **salt**: (String) Salt for password encryption.
- **password**: (String) Encrypted password.
- **role**: (String) Role of the user (one of the following: `"Urban Planner"`, `"Resident"`, `"Visitor"`, `"Urban Developer"`)

#### Example User

```json
{
  "_id": {
    "$oid": "67210139d9ffe8c49a518969"
  },
  "name": "John Doe",
  "email": "john.doe@example.com",
  "salt": "$2b$10$ARfhNI5zPWXiLU5nSrZ5Ce",
  "password": "$2b$10$ARfhNI5zPWXiLU5nSrZ5Ce2fBylNzyDACG99GKxExe7BqGiCzBw2S",
  "role": "Urban Planner"
}
```
## User Management API Endpoints

To manage users effectively, we’ve implemented a set of RESTful API endpoints:

- **POST /users/register**: Registers a new user with a unique email, hashed password, and assigned role.
- **POST /users/login**: Authenticates a user, returning a JWT for secure session management.
- **PUT /users/:id/profile**: Allows a user to update profile information (name and email).
- **PUT /users/:id/change-password**: Enables a user to change their password after verification of the current password.
- **POST /users/forgot-password**: Generates a reset token for password recovery, to be emailed to the user.
- **POST /users/reset-password**: Resets the password using a valid token from the forgot-password step.
- **DELETE /users/:id**: Deletes a user account, accessible to the user or admin roles.
- **PUT /users/:id/role**: Updates the role of a user, accessible only by admin users.

## Document Management API Endpoints

To manage documents effectively, we’ve implemented a set of RESTful API endpoints:

- **POST /documents**: Creates a new document with details such as title, stakeholders, scale, issuance date, and optional coordinates or area reference.
- **GET /documents**: Retrieves all documents with optional query filters (e.g., by type, stakeholders) and pagination support.
- **GET /documents/all/titles**: Retrieves all documents titles (as an array of strings) with optional query filters.
- **GET /documents/:id/available**: Retrieves all documents that can be connected to a specific one.
- **GET /documents/fetch/pagination**: Retrieves documents with pagination, sorting, and filtering.
- **GET /documents/fetch/fields**: Retrieves all documents' titles and dates, sorted by titles in alphabetical order.
- **GET /documents/:id**: Retrieves the details of a specific document by its unique `_id`.
- **PUT /documents/:id**: Updates an existing document’s details, allowing fields like title, description, and relationships to be modified.
- **PUT /documents/:id/municipality**: Updates a document setting is location to the municipality area.
- **PUT /documents/:id/coordinates**: Updates a document setting is location to specific coordinates.
- **DELETE /documents/:id**: Deletes a specific document by its `_id`, removing it from the database.

## Document Relationship API Endpoints

To manage relationships between documents, we’ve added API endpoints that allow users to create, view, update, and delete relationships:

- **POST /documents/:id/relationships**: Adds a new relationship to a document, linking it to another document and specifying the relationship type.
- **GET /documents/:id/relationships**: Retrieves all relationships for a specific document, including details of linked documents and relationship types.
- **PUT /documents/:id/relationships/:relationshipId**: Updates the type of an existing relationship between documents.
- **DELETE /documents/:id/relationships/:relationshipId**: Deletes a specific relationship from a document by its relationship ID.

## Extended Document Relationship API Endpoints

To enhance document relationship management and analysis, we’ve added extended API endpoints:

- **GET /documents/:id/linked-documents**: Retrieves all documents linked to a specified document, with optional filtering by relationship type.
- **GET /documents/relationships**: Retrieves all documents that have a specified relationship type, allowing for targeted relationship analysis.
- **GET /documents/:id/relationship-count**: Returns a count of each relationship type for a specific document, providing a quick summary of relationship distribution.
- **GET /documents/:id/linked-by-depth**: Retrieves documents linked to a specified document within a certain "depth" or level of separation, supporting multi-level relationship analysis.
- **POST /documents/:id/bulk-relationships**: Adds multiple relationships to a document in a single request, streamlining the process of linking documents.
- **GET /documents/:id/relationship-tree**: Retrieves a full hierarchical tree of all documents linked to a specified document, illustrating the entire relationship network.

## Document Tag API Endpoints

To organize and categorize documents more effectively, we’ve added API endpoints that allow users to add tags to documents and retrieve documents by specific tags:

- **POST /documents/:id/tags**: Adds one or more tags to a specified document. Tags are used to categorize documents for easier searching and organization.
  - **Request Body Example**:
    ```json
    {
      "tags": ["Infrastructure", "Urban Development"]
    }
    ```
  - **Description**: This endpoint adds the specified tags to the document with the given ID. If a tag already exists, it won’t be duplicated.

- **GET /documents/tags/:tag**: Retrieves all documents associated with a specific tag.
  - **URL Parameter**: `:tag` - The tag used to filter documents (e.g., `Infrastructure`).
  - **Description**: This endpoint returns a list of all documents that have been tagged with the specified tag, making it easier to locate documents related to particular topics or categories.

## Document Geolocalization API Endpoints

- **PUT /documents/:id/coordinates**: Updates the geolocation coordinates for a specified document.
  - **Request Body Example**:
    ```json
    {
      "type": "Point", 
      "coordinates": [100.0, 0.0]
    }
    ```
  - **Description**: This endpoint updates the geolocation data for the document. The type must be either `Point` or `Polygon`.
  - **Validation**: Ensures the coordinate `type` is valid (`Point` or `Polygon`).
  - **Errors**:
    - `400`: Invalid coordinate type or request.
    - `404`: Document not found.

- **PUT /documents/:id/municipality**: Sets a document to represent a municipality.
  - **Description**: Updates the document's `areaId` to `null` and clears its coordinates, marking it as representing a municipality.
  - **Response Example**:
    ```json
    {
      "_id": "12345",
      "areaId": null,
      "coordinates": []
    }
    ```
  - **Errors**:
    - `404`: Document not found.

## Resource Management API Endpoints

- **POST /documents/:id/resources**: Uploads a file resource and associates it with a document.
  - **Request Body**: Multipart form-data with a file:
    - **Key**: `file` (The file to be uploaded).
  - **Description**: The uploaded file will be added to the `original_resources` array in the specified document.
  - **Response Example**:
    ```json
    {
      "message": "Resource uploaded successfully",
      "resource": {
        "filename": "example.pdf",
        "originalFilename": "example_original.pdf",
        "type": "application/pdf",
        "url": "/uploads/example.pdf"
      }
    }
    ```
  - **Validation**: Ensures the file meets type and size restrictions.
  - **Errors**:
    - `400`: File upload failed or invalid file type.
    - `404`: Document not found.

- **GET /documents/:id/resources**: Retrieves a list of resources associated with a document.
  - **Description**: Fetches all resources (files) linked to the specified document.
  - **Response Example**:
    ```json
    {
      "success": true,
      "resources": [
        {
          "filename": "example.pdf",
          "type": "application/pdf",
          "url": "/uploads/example.pdf"
        }
      ]
    }
    ```
  - **Errors**:
    - `404`: Document not found.

- **GET /documents/:id/resources/:filename/download**: Downloads a specific resource file associated with a document.
  - **Description**: Allows users to download a resource file linked to a document.
  - **Response**: The file is sent as a download.
  - **Errors**:
    - `404`: File or document not found.

These tag APIs enhance document organization by allowing users to tag documents with relevant keywords, which can then be used to search and filter documents efficiently.

## Area Management API Endpoints

To manage areas effectively, we’ve implemented a set of RESTful API endpoints:

- **POST /areas**: Creates a new area with a name (optional) and a GeoJSON polygon.
  - Example of a polygon you can use:
    ```json
    {
      "points": [
        [
          [67.881950910, 20.18], // [lat, long]
          [67.850, 20.2100],   
          [67.8410, 20.2000],
          [67.84037, 20.230],
          [67.8260, 20.288] // can be closed or not
        ]
      ]
    }
    ```
- **GET /areas**: Retrieves all already existing areas.