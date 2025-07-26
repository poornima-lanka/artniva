// frontend/src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // <--- Import useNavigate
import './HomePage.css'; // Make sure you have this CSS file
import heroImage from '../../assets/images/hero-artwork.jpg'; // Assuming you have a hero image

function HomePage() {
  const navigate = useNavigate(); // Initialize navigate hook

  const handlePaintingsClick = () => {
    navigate('/all-artworks'); // Navigate to All Artworks page
  };

  const handleArtMaterialsClick = () => {
    navigate('/art-materials'); // Navigate to the new Art Materials page
  };

  return (
    <div className="home-page">
      <section className="hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-content">
          <h1>Bring Your Walls to Life with Artniva.</h1>
          <p>From Brush to Canvas to Your Home - Shop the Art You Love</p>
          <div className="hero-buttons">
            {/* Ensure your buttons have these onClick handlers */}
            <button className="btn btn-primary" onClick={handleArtMaterialsClick}>
              Art materials
            </button>
            <button className="btn btn-secondary" onClick={handlePaintingsClick}>
              Paintings
            </button>
          </div>
        </div>
      </section>

      {/* You can add more sections to your homepage here, e.g., */}
      {/* <section className="featured-artworks">
        <h2>Featured Artworks</h2>
        <p>Display a carousel or grid of popular artworks here.</p>
      </section>
      <section className="how-it-works">
        <h2>How It Works</h2>
        <p>Explain your process for buying/selling art.</p>
      </section> */}
    </div>
  );
}

export default HomePage;