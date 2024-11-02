import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { RouterProvider, createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import RootLayout from './pages/RootLayout';
import ErrorPage from './pages/ErrorPage';
import HomePage from './pages/HomePage';
import DocumentInsert from './components/FormDocument';

function App() {
  const router = createBrowserRouter([
    {
      element: <RootLayout/>,

      /* Loading errors of a valid route.
      This handles route loading errors and other server errors if not handled directly in components */
      errorElement: <ErrorPage/>,

      children: [
        {
          path: "/",
          element: <HomePage />
        },
        {
          path: "/document-creation",
          element: <DocumentInsert />
        },
        {
          path: "*",
          element: <Navigate to="/" />
        }
      ]
    },
  
  ]);

  return <RouterProvider router={router} />;
}

export default App