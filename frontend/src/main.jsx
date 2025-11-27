import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// import "mapbox-gl/dist/mapbox-gl.css?url";
import "./index.css"; 
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
