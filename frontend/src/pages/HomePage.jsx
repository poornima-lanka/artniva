// frontend/src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // <--- ADD THIS IMPORT
import './HomePage.css'; // Make sure this path is correct
import './ArtMaterialsPage.jsx'
// Import ONLY the images needed for the poornima.jpg design
import heroPainting from '../assets/images/hero-painting.jpg';
import animeCharacter from '../assets/images/anime-character.png';

function HomePage() {
  const navigate = useNavigate(); // <--- ADD THIS LINE: Initialize navigate hook

  // <--- ADD THESE FUNCTIONS
  const handlePaintingsClick = () => {
    console.log("Navigating to /all-artworks"); // For debugging, check your browser console
    navigate('/all-artworks'); // Navigate to All Artworks page
  };

  const handleArtMaterialsClick = () => {
    console.log("Navigating to /art-materials"); // For debugging
    navigate('/art-materials'); // Navigate to the new Art Materials page
  };
  // END ADDED FUNCTIONS

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="new-hero-section">
        <div className="hero-left-content">
          <h1>Bring Your Walls to Life with Artniva.</h1>
          <p>From Brush to Canvas to Your Home - Shop the Art You Love</p>
          <div className="hero-buttons">
            {/* <--- ADD onClick handlers to these buttons */}
            <button className="btn art-materials" onClick={handleArtMaterialsClick}>
              Art materials
            </button>
            <span>or</span>
            <button className="btn paintings" onClick={handlePaintingsClick}>
              Paintings
            </button>
          </div>
          {/* Ensure this image path is correct relative to the images folder */}
          <img src={animeCharacter} alt="Welcome Character" className="anime-character" />
        </div>
        <div className="hero-right-image">
          {/* Ensure this image path is correct relative to the images folder */}
          <img src={heroPainting} alt="Painting on Canvas" />
        </div>
      </section>

      {/* Copyright Section (This will eventually be a separate Footer component) */}
      <section className="copyright-section">
        <p>© 2025 Artniva. All rights reserved.</p>
      </section>
    </div>
  );
}

export default HomePage;