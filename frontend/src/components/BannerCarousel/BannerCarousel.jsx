// frontend/src/components/BannerCarousel/BannerCarousel.jsx
import React, { useState, useEffect } from 'react';
import './BannerCarousel.css'; // Create this CSS file next

const banners = [
  {
    id: 1,
    imageUrl: 'https://via.placeholder.com/1200x300/a3ccff/ffffff?text=ArtNiva:+Mega+Sales!', // Replace with your actual banner image URLs
    altText: 'Mega Sales Banner',
    textLine1: 'ArtNiva: Mega Sales!',
    textLine2: 'Get 70% off in India, now!',
    textColor: '#0D1A44', // Dark blue text
    backgroundColor: '#86B5F7', // Light blue background behind text area
  },
  {
    id: 2,
    imageUrl: 'https://via.placeholder.com/1200x300/f8dc09/0D1A44?text=New+Arrivals+in+Materials',
    altText: 'New Arrivals Banner',
    textLine1: 'Discover New Arrivals!',
    textLine2: 'Fresh materials for your next masterpiece!',
    textColor: '#0D1A44',
    backgroundColor: '#ffd700', // Yellow
  },
  {
    id: 3,
    imageUrl: 'https://via.placeholder.com/1200x300/4CAF50/FFFFFF?text=Summer+Art+Workshops',
    altText: 'Workshop Banner',
    textLine1: 'Join Our Summer Workshops!',
    textLine2: 'Learn new techniques from professional artists.',
    textColor: '#FFFFFF',
    backgroundColor: '#388E3C', // Green
  },
];

function BannerCarousel() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) =>
        (prevIndex + 1) % banners.length
      );
    }, 5000); // Change banner every 5 seconds (5000ms)

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  const currentBanner = banners[currentBannerIndex];

  return (
    <div className="banner-carousel">
      <div className="banner-slide" key={currentBanner.id}>
        <img src={currentBanner.imageUrl} alt={currentBanner.altText} className="banner-image" />
        <div className="banner-overlay" style={{ backgroundColor: currentBanner.backgroundColor }}>
            <h2 style={{ color: currentBanner.textColor }}>{currentBanner.textLine1}</h2>
            <p style={{ color: currentBanner.textColor }}>{currentBanner.textLine2}</p>
        </div>
      </div>
      <div className="banner-dots">
        {banners.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentBannerIndex ? 'active' : ''}`}
            onClick={() => setCurrentBannerIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default BannerCarousel;