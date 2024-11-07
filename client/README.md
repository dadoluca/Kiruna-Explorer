# Kiruna eXplorer - React Frontend

This project is a React.js frontend for the Kiruna eXplorer application, designed to offer a streamlined, accessible experience for document exploration, registration, and login. It includes an error-handling layout and user authentication features, while also providing a document creation form.

## Table of Contents

- [How to run](#how-to-run)
- [Application Routes](#application-routes)
- [Main Components](#main-components)

---

## How to run

Before running the application, make sure you have [Node.js](https://nodejs.org/) installed on your system. Then, follow these steps:

1. **Open a terminal in the client folder:**
   Navigate to the main `client` directory where the application code is located.

2. **Install dependencies:**
   ```bash
   npm install

3. **Run the client:**
    ```bash
    npm run dev

Once the development server is running, open your browser and go to http://localhost:5173 (or whichever port is specified in the terminal) to access the Kiruna eXplorer frontend.

## Application Routes

The following routes are available in the Kiruna eXplorer application:

* Home Page (/): Displays the main landing page containing the map and the documents.

* Register Page (/register): Renders a registration form for new users.

* LoginPage (/login): Allows existing users to log in, allowing the creation of new documents and links betweem them.

* Document Creation (/document-creation): Provides a form for creating and submitting new documents.

* Error Page (*): Handles unknown routes and navigation errors, redirecting users to the home page.
