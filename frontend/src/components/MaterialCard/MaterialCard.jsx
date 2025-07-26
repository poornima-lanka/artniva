import React from 'react';
import './MaterialCard.css';
import { FaHeart, FaShare } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MaterialCard = ({ material, addToCartHandler, likeMaterialHandler }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const isMaterialLiked = userInfo && material.likes.some(
    (like) => like.toString() === userInfo._id.toString()
  );

  // Share functionality directly in the card
  const shareHandler = () => {
    if (navigator.share) {
      navigator.share({
        title: material.name,
        text: `Check out this art material: ${material.name}`,
        url: `${window.location.origin}/materials/${material._id}`, // Dynamic URL
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that do not support the Web Share API
      alert('Sharing is not supported on this browser. You can manually copy the link.');
      // Optionally, you could implement a custom copy-to-clipboard here
    }
  };

  return (
    <div className="material-card">
      <Link to={`/materials/${material._id}`} className="material-card-link">
        <img src={material.imageUrl} alt={material.name} className="material-image" />
        <div className="material-details">
          <h3 className="material-name">{material.name}</h3>
          <p className="material-brand">{material.brand}</p>
          <p className="material-price">₹{material.price.toFixed(2)}</p>
        </div>
      </Link>
      <div className="material-actions">
        <button
          className={`like-button ${isMaterialLiked ? 'liked' : ''}`}
          onClick={() => likeMaterialHandler(material._id)}
        >
          <FaHeart />
        </button>
        <button className="share-button" onClick={shareHandler}>
          <FaShare />
        </button>
      </div>
      <button className="add-to-cart-btn" onClick={() => addToCartHandler(material)}>
        Add to Cart
      </button>
    </div>
  );
};

export default MaterialCard;