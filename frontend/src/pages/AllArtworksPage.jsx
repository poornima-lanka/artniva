import React, { useState, useEffect, useCallback } from 'react';
import './AllArtworksPage.css';
import { useCart } from '../context/CartContext';
import { Link, useLocation } from 'react-router-dom';
import { FaHeart, FaShare } from 'react-icons/fa';

const BACKEND_URL = "https://artniva.onrender.com";

function AllArtworksPage() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [cartMessage, setCartMessage] = useState(null);
  const { fetchCartItems } = useCart();

  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get('keyword') || '';
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/products?keyword=${keyword}`);
      const data = await response.json();
      setArtworks(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  // FIX: ఇక్కడ item అనేది ఆబ్జెక్ట్ అయినా స్ట్రింగ్ అయినా పనిచేస్తుంది
  const getImageUrl = (item) => {
    let path = "";
    if (typeof item === 'string') {
      path = item;
    } else {
      path = item?.image || item?.imageUrl || "";
    }

    if (!path) return "https://placehold.co/300x200?text=No+Image";
    if (path.startsWith('http')) return path;

    const cleanPath = path.replace(/\\/g, '/');

    // Case: Frontend Local Images (Port 3000)
    if (cleanPath.includes('/images/')) {
      return `${window.location.origin}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
    }

    // Case: Dashboard/Backend Uploads (Port 5000)
    return `${BACKEND_URL}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  };

  const handleLikeClick = async (artworkId) => {
    if (!userInfo?.token) return alert("Please log in.");
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/${artworkId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      if (res.ok) fetchArtworks();
    } catch (err) { console.error(err); }
  };

  const shareHandler = (art) => {
    const url = `${window.location.origin}/artwork/${art._id}`;
    if (navigator.share) {
      navigator.share({ title: art.name, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  const addToCartHandler = async (art) => {
    if (!userInfo?.token) return alert("Please log in.");
    try {
      const res = await fetch(`${BACKEND_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ productId: art._id, quantity: 1, itemType: 'Product' })
      });
      if (res.ok) {
        setCartMessage(`${art.name} added!`);
        fetchCartItems();
        setTimeout(() => setCartMessage(null), 3000);
      }
    } catch (err) { console.error(err); }
  };

  // FILTER FIX: Paintings లో మెటీరియల్స్ రాకుండా జాగ్రత్త పడ్డాము
  const filteredArtworks = artworks.filter(art => {
    const category = art.category?.toLowerCase() || '';
    const name = art.name?.toLowerCase() || '';
    return !category.includes('material') && !category.includes('kit') && !name.includes('kit');
  });

  const artworkTypes = ['All', ...new Set(filteredArtworks.map(art => art.category))];

  if (loading) return <div className="loading"><h2>Loading Artworks...</h2></div>;

  return (
    <div className="all-artworks-page">
      <h2 className="page-title">Explore All Artworks</h2>
      {cartMessage && <div className="cart-notification">{cartMessage}</div>}
      
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
        {filteredArtworks
          .filter(art => selectedType === 'All' || art.category === selectedType)
          .map(art => {
            const isLiked = userInfo && art.likes?.some(id => id.toString() === userInfo._id.toString());
            return (
              <div key={art._id} className="artwork-card">
                <Link to={`/artwork/${art._id}`} className="artwork-card-link">
                  <img src={getImageUrl(art)} alt={art.name} className="artwork-image" />
                  <div className="artwork-details">
                    <h3 className="art-name">{art.name}</h3>
                    <p className="art-price">₹{art.price}</p>
                  </div>
                </Link>
                <div className="artwork-actions">
                  <button className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={() => handleLikeClick(art._id)}>
                    <FaHeart color={isLiked ? '#e74c3c' : '#bdc3c7'} />
                  </button>
                  <button className="share-btn" onClick={() => shareHandler(art)}>
                    <FaShare color="#34495e" />
                  </button>
                </div>
                <button className="add-to-cart-btn" onClick={() => addToCartHandler(art)}>
                  Add to Cart
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default AllArtworksPage;