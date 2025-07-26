// frontend/src/pages/AllArtworksPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './AllArtworksPage.css';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

function AllArtworksPage() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('All');
  const [cartMessage, setCartMessage] = useState(null);
  const { fetchCartItems } = useCart();
  const [userInfo, setUserInfo] = useState(null);
  const [likedArtworks, setLikedArtworks] = useState(new Set());

  // Use useCallback to memoize the fetch function and prevent infinite loops
  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setArtworks(data);
    } catch (err) {
      console.error("Failed to fetch artworks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch artworks and user info on component mount
  useEffect(() => {
    fetchArtworks();
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedUserInfo);
    }
  }, [fetchArtworks]);

  // Update likedArtworks state when artworks or userInfo changes
  useEffect(() => {
    if (userInfo && artworks.length > 0) {
      const newLikedArtworks = new Set();
      artworks.forEach(art => {
        // Check if the current user's ID is in the artwork's likes array
        if (art.likes && art.likes.includes(userInfo._id)) {
          newLikedArtworks.add(art._id);
        }
      });
      setLikedArtworks(newLikedArtworks);
    }
  }, [artworks, userInfo]);

  // Handle like/unlike click
  const handleLikeClick = async (artworkId) => {
    if (!userInfo || !userInfo.token) {
      alert("Please log in to like an artwork.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${artworkId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle like status.');
      }

      // Optimistically update the likedArtworks state
      setLikedArtworks(prevLikedArtworks => {
        const newSet = new Set(prevLikedArtworks);
        if (newSet.has(artworkId)) {
          newSet.delete(artworkId);
        } else {
          newSet.add(artworkId);
        }
        return newSet;
      });

    } catch (error) {
      console.error('Error toggling like:', error);
      alert(error.message || 'Could not toggle like status.');
    }
  };

  const addToCartHandler = async (artwork) => {
    setCartMessage(null);
    try {
      if (!userInfo || !userInfo.token) {
        setCartMessage("Please log in to add items to cart.");
        return;
      }
      const token = userInfo.token;

      const itemData = {
        productId: artwork._id,
        quantity: 1,
        itemType: 'Product'
      };

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      });

      const backendResponseData = await response.json();
      if (!response.ok) {
        throw new Error(backendResponseData.message || `Failed to add ${artwork.name} to cart.`);
      }

      setCartMessage(`${artwork.name} added to cart!`);
      await fetchCartItems();
    } catch (error) {
      console.error('Error adding artwork to cart:', error);
      setCartMessage(error.message || "Something went wrong adding artwork to cart.");
    }
  };

  const artworkTypes = ['All', ...new Set(artworks.map(art => art.category))];
  const filteredArtworks = artworks.filter(art => selectedType === 'All' || art.category === selectedType);

  if (loading) return <div className="all-artworks-page"><h2>Loading Artworks...</h2><p>Please wait while we fetch the amazing collection.</p></div>;
  if (error) return <div className="all-artworks-page"><h2>Error Loading Artworks</h2><p>Something went wrong: {error}</p><p>Please ensure your backend server is running and accessible.</p></div>;

  return (
    <div className="all-artworks-page">
      <h2>Explore All Artworks</h2>
      {cartMessage && (
        <p className="cart-message" style={{ color: cartMessage.includes('added') ? 'green' : 'red' }}>
          {cartMessage}
        </p>
      )}
      <div className="filter-buttons">
        {artworkTypes.map(type => (
          <button
            key={type}
            className={`filter-btn ${selectedType === type ? 'active' : ''}`}
            onClick={() => setSelectedType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="artworks-grid">
        {filteredArtworks.length > 0 ? (
          filteredArtworks.map(art => (
            <div key={art._id} className="artwork-card">
              <Link to={`/artwork/${art._id}`} className="artwork-card-link">
                <img src={art.image} alt={art.name} className="artwork-image" />
                <div className="artwork-details">
                  <h3>{art.name}</h3>
                  {art.category === 'Painting' && art.artistName && (
                    <p className="artist-name">By {art.artistName}</p>
                  )}
                  <p className="artwork-type">Category: {art.category}</p>
                  <p className="artwork-price">Price: ₹{art.price.toFixed(2)}</p>

                  <div className="artwork-interactions">
                    <div className="rating">
                      <i className="fas fa-star"></i> {art.rating != null ? art.rating.toFixed(1) : 'N/A'} ({art.numReviews != null ? art.numReviews : 0} reviews)
                    </div>
                    <div className="actions">
                      <i
                        className={`fas fa-heart ${likedArtworks.has(art._id) ? 'liked' : ''}`}
                        onClick={(e) => { e.preventDefault(); handleLikeClick(art._id); }}
                      ></i>
                      <i className="fas fa-share-alt"></i>
                    </div>
                  </div>
                </div>
              </Link>
              <button className="add-to-cart-btn" onClick={() => addToCartHandler(art)} disabled={art.countInStock === 0}>
                {art.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          ))
        ) : (
          <p className="no-artworks-message">No artworks found for this category.</p>
        )}
      </div>
    </div>
  );
}

export default AllArtworksPage;