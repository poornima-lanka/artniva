import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LikedArtworksPage.css'; // Don't forget to create this CSS file

const LikedArtworksPage = () => {
  const [likedArtworks, setLikedArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // First, get user info from local storage
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    } else {
      // If no user is logged in, show an error and stop loading
      setError("Please log in to see your liked artworks.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Then, if user info exists, fetch the liked artworks
    if (userInfo && userInfo.token) {
      const fetchLikedArtworks = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/products/liked', {
            headers: {
              'Authorization': `Bearer ${userInfo.token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch liked artworks.');
          }
          const data = await response.json();
          setLikedArtworks(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchLikedArtworks();
    }
  }, [userInfo]); // This effect runs whenever userInfo state changes

  if (loading) {
    return (
      <div className="liked-artworks-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="liked-artworks-page">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="liked-artworks-page">
      <h2>Your Liked Artworks</h2>
      {likedArtworks.length > 0 ? (
        <div className="liked-artworks-grid">
          {likedArtworks.map(art => (
            <div key={art._id} className="artwork-card">
              <Link to={`/artwork/${art._id}`}>
                <img src={art.image} alt={art.name} className="artwork-image" />
                <div className="artwork-details">
                  <h3>{art.name}</h3>
                  <p className="artwork-price">₹{art.price.toFixed(2)}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>You haven't liked any artworks yet.</p>
      )}
    </div>
  );
};

export default LikedArtworksPage;