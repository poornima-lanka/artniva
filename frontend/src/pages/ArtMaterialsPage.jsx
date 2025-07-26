// frontend/src/pages/ArtMaterialsPage.jsx
import React, { useState, useEffect } from 'react';
import MaterialCard from '../components/MaterialCard/MaterialCard';
import BannerCarousel from '../components/BannerCarousel/BannerCarousel';
import './ArtMaterialsPage.css';
import { useCart } from '../context/CartContext';

function ArtMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState(null);

  const { fetchCartItems } = useCart();

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/materials');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched materials data:", data);
      setMaterials(data);
    } catch (err) {
      console.error("Failed to fetch art materials:", err);
      setError("Failed to load art materials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const addToCartHandler = async (material) => {
    setCartMessage(null);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        setCartMessage("Please log in to add items to cart.");
        return;
      }
      const token = userInfo.token;

      const itemData = {
        productId: material._id,
        quantity: 1,
        itemType: 'Material'
      };

      console.log('Sending material to cart from materials page:', itemData);

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      });

      const backendResponseData = await response.json();
      console.log('Parsed data from POST /api/cart (Material List):', backendResponseData);

      if (!response.ok) {
        throw new Error(backendResponseData.message || `Failed to add ${material.name} to cart.`);
      }

      setCartMessage(`${material.name} added to cart!`);
      await fetchCartItems();
    } catch (error) {
      console.error('Error adding material to cart from materials page:', error);
      setCartMessage(error.message || "Something went wrong adding to cart.");
    }
  };

  const likeMaterialHandler = async (materialId) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) {
      alert("Please log in to like materials.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/materials/${materialId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to like/unlike material.');
      }
      // Re-fetch materials to update the like status on the page
      await fetchMaterials();
    } catch (error) {
      console.error('Error liking material:', error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="art-materials-page">
        <div className="loading-message">Loading art materials...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="art-materials-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="art-materials-page">
      <BannerCarousel />
      <h1>All Art Materials</h1>

      {cartMessage && (
        <p className="cart-message" style={{ color: cartMessage.includes('added') ? 'green' : 'red' }}>
          {cartMessage}
        </p>
      )}

      {materials.length === 0 ? (
        <p className="no-materials-found">No art materials found at the moment. Please add some using Thunder Client!</p>
      ) : (
        <div className="materials-grid">
          {materials.map((material) => (
            <MaterialCard
              key={material._id}
              material={material}
              addToCartHandler={addToCartHandler}
              likeMaterialHandler={likeMaterialHandler}
              // Removed onShare prop as it's handled internally by MaterialCard now
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ArtMaterialsPage;