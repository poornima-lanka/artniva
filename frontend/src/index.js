// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- MUST ADD THIS IMPORT
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ADD THE ROUTER WRAPPER HERE */}
    <BrowserRouter> 
      <App /> 
    </BrowserRouter>
  </React.StrictMode>
);