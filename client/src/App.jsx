import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { DocumentProvider } from './contexts/DocumentContext';
import RootLayout from './pages/RootLayout';
import LandingPage from './pages/LandingPage';
import ErrorPage from './pages/ErrorPage';
import MapPage from './pages/MapPage';
import LoginPage  from './pages//LoginPage';
import RegisterPage from './pages/RegisterPage';
import DocumentCreationPage from './pages/DocumentCreationPage';
import ScrollableDocumentsList from './components/ListDocument';

function App() {
  const { loggedIn } = useContext(AuthContext);
  const router = createBrowserRouter([
    {
      element: <RootLayout/>,

      /* Loading errors of a valid route.
      This handles route loading errors and other server errors if not handled directly in components */
      errorElement: <ErrorPage/>,

      children: [
        {
          path: "/",
          element: <LandingPage />
        },
        {
          path: "/map",
          element: <MapPage />
        },
        {
          path: "/register",
          element: loggedIn ? <Navigate to="/map" /> : <RegisterPage />,
        },
        {
          path: "/login",
          element: loggedIn ? <Navigate to="/map" /> : <LoginPage  />,
        },
        {
          path: "/document-creation",
          element: <DocumentCreationPage />
        },
        {
          path: "/documents-list",
          element: <ScrollableDocumentsList />
        },
        {
          path: "*",
          element: <Navigate to="/" />
        }
      ]
    },
  
  ]);

  return (
    <DocumentProvider>
      <RouterProvider router={router} />
      <ToastContainer 
        position="top-center" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
    </DocumentProvider>
  );
}

export default App