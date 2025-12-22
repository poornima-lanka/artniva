import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LikedArtworksPage.css';

const LikedArtworksPage = () => {
  const [likedItems, setLikedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    } else {
      setError("Please log in to see your liked items.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.token) {
      const fetchAllLiked = async () => {
        try {
          setLoading(true);
          
          // Fetch Liked Paintings (Products)
          const productRes = await fetch('https://artniva.onrender.com/api/products/liked', {
            headers: { 'Authorization': `Bearer ${userInfo.token}` },
          });
          
          // Fetch Liked Materials (Separate API call)
          const materialRes = await fetch('https://artniva.onrender.com/api/materials/liked', {
            headers: { 'Authorization': `Bearer ${userInfo.token}` },
          });

          let products = [];
          let materials = [];

          if (productRes.ok) products = await productRes.json();
          if (materialRes.ok) materials = await materialRes.json();

          // Combine both arrays and add a 'type' to distinguish them
          const combined = [
            ...products.map(p => ({ ...p, itemType: 'Painting' })),
            ...materials.map(m => ({ ...m, itemType: 'Material' }))
          ];

          setLikedItems(combined);
        } catch (err) {
          setError("Failed to fetch liked items.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchAllLiked();
    }
  }, [userInfo]);

  if (loading) return <div className="liked-artworks-page"><h2>Loading liked items...</h2></div>;
  if (error) return <div className="liked-artworks-page"><p className="error-message">{error}</p></div>;

  return (
    <div className="liked-artworks-page">
      <h2>Your Liked Artworks & Materials</h2>
      {likedItems.length > 0 ? (
        <div className="liked-artworks-grid">
          {likedItems.map(item => (
            <div key={item._id} className="artwork-card">
              {/* Correct Link based on type */}
              <Link to={item.itemType === 'Material' ? `/material/${item._id}` : `/artwork/${item._id}`}>
                
                {/* Image Fix: Same logic as detail page */}
                <img 
                  src={
                    item.image 
                      ? `https://artniva.onrender.com/uploads/${item.image.split(/[\\/]/).pop()}` 
                      : item.imageUrl
                  } 
                  alt={item.name} 
                  className="artwork-image" 
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300?text=No+Image";
                  }}
                />

                <div className="artwork-details">
                  <span className="item-badge">{item.itemType}</span>
                  <h3>{item.name}</h3>
                  <p className="artwork-price">₹{item.price.toFixed(2)}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>You haven't liked anything yet.</p>
      )}
    </div>
  );
};

export default LikedArtworksPage;