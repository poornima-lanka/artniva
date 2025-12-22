import React from 'react';
import './MaterialCard.css';
import { FaHeart, FaShare } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MaterialCard = ({ material, addToCartHandler, likeMaterialHandler }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const isMaterialLiked = userInfo && material.likes?.some(
    (like) => like.toString() === userInfo._id.toString()
  );

  const shareHandler = (e) => {
    e.preventDefault(); // Link click trigger avvakunda
    if (navigator.share) {
      navigator.share({
        title: material.name,
        text: `Check out this art material: ${material.name}`,
        url: `${window.location.origin}/materials/${material._id}`,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/materials/${material._id}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="material-card">
      <Link to={`/materials/${material._id}`} className="material-card-link">
        <img 
          src={material.imageUrl} 
          alt={material?.name} 
          className="material-image" 
          onError={(e) => { 
            e.target.src = 'https://placehold.co/300x200?text=Image+Not+Found'; 
          }}
        />
  
        <div className="material-details">
          <h3 className="material-name">{material.name}</h3>
          <p className="material-brand">{material.brand || 'Artiva Special'}</p>
          <p className="material-price">₹{material.price?.toFixed(2) || '0.00'}</p>
        </div>
      </Link>
      <div className="material-actions">
        <button
          className={`like-button ${isMaterialLiked ? 'liked' : ''}`}
          onClick={() => likeMaterialHandler(material._id)}
        >
          <FaHeart color={isMaterialLiked ? '#e74c3c' : '#bdc3c7'} />
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