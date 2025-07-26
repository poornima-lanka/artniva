// frontend/src/components/Layout/Layout.jsx
import React from 'react';
import Header from './Header';
// Remove direct import of HomePage here, as it will be routed via App.js
// import HomePage from '../../pages/HomePage'; // DELETE THIS LINE
import './Layout.css';

function Layout({ children }) { // <--- Accept children prop
  return (
    <div className="layout-container">
      <Header />
      <main className="content-area">
         {children} {/* <--- Render the children (which will be your Routes/Pages) */}
      </main>
    </div>
  );
}
export default Layout;