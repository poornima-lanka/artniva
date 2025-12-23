// frontend/src/pages/ProductDetailsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductDetailsPage.css';

function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState(null);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const [showShareModal, setShowShareModal] = useState(false);

  // --- NEW STATE FOR LIKES ---
  const [isLiked, setIsLiked] = useState(false);
  // --- END NEW STATE ---

  const { fetchCartItems } = useCart();

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://artniva.onrender.com/api/products/${id}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Fetched product details:", data);
      setProduct(data);
      setLoading(false);

      // --- NEW: Check if current user has liked this product ---
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
        // Assuming your product object has a 'likes' array containing user IDs
        if (data.likes && data.likes.includes(parsedUserInfo._id)) {
          setIsLiked(true);
        } else {
          setIsLiked(false);
        }
      }
      // --- END NEW CHECK ---

    } catch (err) {
      console.error("Failed to fetch product details:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // userInfo is now set inside fetchProductDetails
    if (id) {
      fetchProductDetails();
    }
  }, [id, fetchProductDetails]);

  const reviewSubmitHandler = async (e) => {
    e.preventDefault();
    setReviewMessage(null);

    if (!userInfo) {
      setReviewMessage("Please log in to submit a review.");
      return;
    }

    if (!reviewRating || !reviewComment) {
      setReviewMessage("Please enter a rating and a comment.");
      return;
    }

    try {
      const response = await fetch(`https://artniva.onrender.com/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review.');
      }

      setReviewMessage('Review submitted successfully!');
      setReviewRating(0);
      setReviewComment('');
      fetchProductDetails(); // Re-fetch to update reviews
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewMessage(err.message || "Failed to submit review.");
    }
  };

  const addToCartHandler = async () => {
    setCartMessage(null);
    if (!product) return;

    if (!userInfo || !userInfo.token) {
      setCartMessage("Please log in to add items to cart.");
      return;
    }
    const token = userInfo.token;

    try {
      const itemData = {
        productId: product._id,
        quantity: 1,
        itemType: 'Product'
      };

      console.log('Sending item to cart from details page:', itemData);

      const response = await fetch('https://artniva.onrender.com/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      });

      const backendResponseData = await response.json();
      console.log('Parsed data from POST /api/cart (Product Details):', backendResponseData);

      if (!response.ok) {
        throw new Error(backendResponseData.message || `Failed to add ${product.name} to cart.`);
      }

      setCartMessage(`${product.name} added to cart!`);
      await fetchCartItems();
    } catch (error) {
      console.error('Error adding product to cart from details page:', error);
      setCartMessage(error.message || "Something went wrong adding to cart.");
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copied to clipboard!'))
      .catch((err) => console.error('Failed to copy link: ', err));
    handleCloseShareModal();
  };

  // --- NEW: Like Button Handler ---
  const handleLikeClick = async () => {
    if (!userInfo || !userInfo.token) {
      alert("Please log in to like a product.");
      return;
    }

    try {
      const response = await fetch(`https://artniva.onrender.com/api/products/${id}/like`, { // <--- THIS IS THE API CALL
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

      const data = await response.json();
      setIsLiked(data.isLiked); // Update state based on backend response
      // Optionally, you might want to re-fetch product details to update likes count on UI if you add it
      // fetchProductDetails();

    } catch (error) {
      console.error('Error toggling like:', error);
      alert(error.message || 'Could not toggle like status.');
    }
  };
  // --- END NEW: Like Button Handler ---


  if (loading) {
    return (
      <div className="product-details-page-container">
        <div className="loading-message">Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-page-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page-container">
        <div className="no-product-found-message">Product not found.</div>
      </div>
    );
  }

  const hasUserReviewed = userInfo && product.reviews && product.reviews.some(
    (review) => review.user === userInfo._id
  );

  const calculateRatingBreakdown = () => {
    const ratings = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    if (product.reviews && product.reviews.length > 0) {
      product.reviews.forEach(review => {
        if (ratings[review.rating]) {
          ratings[review.rating]++;
        }
      });
    }

    const totalReviews = product.numReviews || 0;
    const breakdown = Object.keys(ratings).map(star => {
      const count = ratings[star];
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      return { star: Number(star), count, percentage };
    }).sort((a, b) => b.star - a.star);
    return breakdown;
  };

  const ratingBreakdown = calculateRatingBreakdown();

  return (
    <div className="product-details-page-container">
      {cartMessage && (
        <p className="cart-message" style={{ color: cartMessage.includes('added') ? 'green' : 'red' }}>
          {cartMessage}
        </p>
      )}
      <div className="product-details-content">
        <div className="product-image-section">
         
          <img src={
                      product.image 
                         ? `https://artniva.onrender.com/uploads/${product.image.split(/[\\/]/).pop()}` 
                            :(product.imageUrl || "https://via.placeholder.com/400?text=No+Image+URL")
                             } 
                             alt={product.name} 
                                className="product-detail-image" 
                                onError={(e) => {
                                 e.target.onerror = null; 
                                   e.target.src = "https://via.placeholder.com/400?text=Image+File+Missing+on+Server";
                                      }}
           />
        </div>
        <div className="product-info-section">
          <h1>{product.name}</h1>
          {product.category === 'Painting' && product.artistName && (
            <p className="artist-name">By: {product.artistName}</p>
          )}
          <p className="product-category">Category: {product.category}</p>
          <p className="product-price">Price: ₹{product.price.toFixed(2)}</p>
          <p className="product-description">{product.description}</p>
          <p className="product-stock">Status: {product.countInStock > 0 ? `In Stock (${product.countInStock})` : 'Out of Stock'}</p>

          <div className="product-interactions-details">
            <div className="rating">
              <i className="fas fa-star"></i> {product.rating != null ? product.rating.toFixed(1) : 'N/A'} ({product.numReviews != null ? product.numReviews : 0} reviews)
            </div>
            <div className="actions">
              {/* --- MODIFIED: Like Icon with Conditional Class --- */}
              <i
                className={`fas fa-heart ${isLiked ? 'liked' : ''}`} // Add 'liked' class if isLiked is true
                onClick={handleLikeClick}
                style={{ cursor: 'pointer' }}
              ></i>
              <i className="fas fa-share-alt" onClick={handleShareClick} style={{ cursor: 'pointer' }}></i>
            </div>
          </div>

          <button
            className="add-to-cart-details-btn"
            onClick={addToCartHandler}
            disabled={product.countInStock === 0}
          >
            {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      <div className="product-reviews-section">
        <h2>Customer Reviews</h2>
        {reviewMessage && (
          <p className="review-message" style={{ color: reviewMessage.includes('successfully') ? 'green' : 'red' }}>
            {reviewMessage}
          </p>
        )}

        {product.numReviews > 0 && (
          <div className="rating-summary">
            <div className="overall-rating-large">
              {product.rating != null ? product.rating.toFixed(1) : 'N/A'} out of 5 stars
            </div>
            <div className="rating-breakdown-bars">
              {ratingBreakdown.map((item) => (
                <div key={item.star} className="rating-bar-row">
                  <span className="star-label">{item.star} star</span>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                  <span className="rating-percentage">{item.percentage.toFixed(0)}%</span>
                  <span className="rating-count">({item.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {userInfo ? (
          hasUserReviewed ? (
            <p>You have already reviewed this product.</p>
          ) : (
            <form onSubmit={reviewSubmitHandler} className="review-form">
              <h3>Write a Customer Review</h3>
              <div className="form-group">
                <label htmlFor="rating">Rating:</label>
                <select
                  id="rating"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  required
                >
                  <option value="">Select...</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comment">Comment:</label>
                <textarea
                  id="comment"
                  rows="3"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-review-btn">Submit Review</button>
            </form>
          )
        ) : (
          <p>Please <a href="/login">log in</a> to write a review.</p>
        )}

        {product.reviews && product.reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="reviews-list">
            <h3>Individual Reviews</h3>
            {product.reviews && product.reviews.map((review) => (
              <div key={review._id} className="review-item">
                <strong>{review.name}</strong>
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={
                        review.rating >= i + 1
                          ? 'fas fa-star'
                          : review.rating >= i + 0.5
                          ? 'fas fa-star-half-alt'
                          : 'far fa-star'
                      }
                    ></i>
                  ))}
                  <span> {review.rating.toFixed(1)}</span>
                </div>
                <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showShareModal && (
        <div className="share-modal-overlay" onClick={handleCloseShareModal}>
          <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share</h3>
              <button className="close-modal-btn" onClick={handleCloseShareModal}>&times;</button>
            </div>
            <div className="share-options">
              <a href={`mailto:?subject=Check out this product!&body=I found this amazing product: ${window.location.href}`} className="share-option">
                <i className="fas fa-envelope"></i> Email
              </a>
              <a href={`https://pinterest.com/pin/create/button/?url=${window.location.href}&media=${product.imageUrl || product.image}&description=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" className="share-option">
                <i className="fab fa-pinterest"></i> Pinterest
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="share-option">
                <i className="fab fa-facebook"></i> Facebook
              </a>
              <button onClick={copyLinkToClipboard} className="share-option">
                <i className="fas fa-link"></i> Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailsPage;