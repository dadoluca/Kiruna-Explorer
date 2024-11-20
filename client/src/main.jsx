import React from 'react'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/leaflet';
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)