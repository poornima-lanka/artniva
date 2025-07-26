// frontend/src/pages/CombinedShopPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Combinedpage.css'; // You'll need to create this CSS file

const Combinedpage = () => {
  const [items, setItems] = useState({ artworks: [], materials: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get('/api/shop');
        console.log('API Response Data:', data); // <--- ADDED LOG
        setItems(data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch Error:', err); // <--- ADDED LOG
        setError(err.message);
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  console.log('Component State:', { items, loading, error }); // <--- ADDED LOG

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="combined-shop-page">
      <h1>All Artworks & Materials</h1>
      
      <div className="item-list">
        {items.artworks.map((artwork) => (
          <div key={artwork._id} className="item-card">
            <img src={artwork.image} alt={artwork.title} />
            <h4>{artwork.title}</h4>
            <p>${artwork.price}</p>
          </div>
        ))}

        {items.materials.map((material) => (
          <div key={material._id} className="item-card">
            <img src={material.image} alt={material.name} />
            <h4>{material.name}</h4>
            <p>${material.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Combinedpage;