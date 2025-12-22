// frontend/src/pages/MaterialDetailsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './MaterialDetailsPage.css';

function MaterialDetailsPage() {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  
  // --- ADDED: NEW STATE FOR LIKE & SHARE ---
  const [isLiked, setIsLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  // --- END NEW STATE ---

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { fetchCartItems } = useCart();

  const fetchMaterialDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/materials/${id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setMaterial(data);

      // --- ADDED: Check if current user liked this material ---
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
        if (data.likes && data.likes.includes(parsedUserInfo._id)) {
          setIsLiked(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch material details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMaterialDetails();
    }
  }, [id, reviewSuccess, fetchMaterialDetails]);

  // --- ADDED: Like Handler ---
  // handleLikeClick function ni ila update cheyandi
const handleLikeClick = async () => {
  if (!userInfo || !userInfo.token) {
    alert("Please log in to like this material.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/materials/${id}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userInfo.token}`,
        'Content-Type': 'application/json'
      },
    });

    const data = await response.json();
    if (response.ok) {
      // Toggle the state based on backend response
      setIsLiked(!isLiked); 
    } else {
      console.error("Like error:", data.message);
    }
  } catch (err) {
    console.error("Like request failed:", err);
  }
};

  // --- ADDED: Share Handler ---
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copied to clipboard!'))
      .catch((err) => console.error('Failed to copy link: ', err));
    setShowShareModal(false);
  };

  const addToCartHandler = async () => {
    setCartMessage(null);
    if (!material) return;
    try {
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
        throw new Error(backendResponseData.message || `Failed to add ${material.name} to cart.`);
      }
      setCartMessage(`${material.name} added to cart!`);
      await fetchCartItems();
    } catch (error) {
      setCartMessage(error.message || "Something went wrong adding to cart.");
    }
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError(null);
    const token = userInfo?.token;
    if (!token) {
      setReviewError('Please log in to leave a review.');
      setReviewLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/materials/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review.');
      }
      setReviewSuccess(true);
      setRating(0);
      setComment('');
      alert('Review submitted successfully!');
    } catch (err) {
      setReviewError(err.message || 'An unexpected error occurred.');
    } finally {
      setReviewLoading(false);
    }
  };

  const hasReviewed = material && material.reviews && Array.isArray(material.reviews)
    ? material.reviews.some(review => review.user.toString() === userInfo?._id.toString())
    : false;

  if (loading) return <div className="material-details-page-container"><div className="loading-message">Loading...</div></div>;
  if (error) return <div className="material-details-page-container"><div className="error-message">{error}</div></div>;
  if (!material) return <div className="material-details-page-container"><div className="no-product-found-message">Material not found.</div></div>;

  return (
    
    <div className="material-details-page-container">
      {cartMessage && (
        <p className="cart-message" style={{ color: cartMessage.includes('added') ? 'green' : 'red' }}>
          {cartMessage}
        </p>
      )}
      <div className="material-details-content">
        <div className="material-image-section">
         <img 
    src={
      material.image 
        ? `http://localhost:5000/uploads/${material.image.split(/[\\/]/).pop()}` 
        : material.imageUrl
    } 
    alt={material.name} 
    className="material-detail-image" 
    onError={(e) => {
      // Okaవేళ image lekapothe placeholder chupisthundi
      e.target.src = "https://via.placeholder.com/400?text=Image+Not+Found";
    }}
  />
        </div>
        <div className="material-info-section">
          <h1>{material.name}</h1>
          <p className="material-category">Category: {material.category}</p>
          <p className="material-price">Price: ₹{material.price.toFixed(2)}</p>
          <p className="material-description">{material.description}</p>
          <p className="material-stock">Status: {material.countInStock > 0 ? `In Stock (${material.countInStock})` : 'Out of Stock'}</p>

          <div className="material-interactions-details">
            <div className="rating">
              <i className="fas fa-star"></i> {material.rating != null ? material.rating.toFixed(1) : 'N/A'} ({material.numReviews != null ? material.numReviews : 0} reviews)
            </div>
            <div className="actions">
              {/* FIX: Interactive Like Icon */}
              <i 
                className={`fas fa-heart ${isLiked ? 'liked' : ''}`} 
                onClick={handleLikeClick}
                style={{ cursor: 'pointer', color: isLiked ? 'red' : 'inherit' }}
              ></i>
              {/* FIX: Interactive Share Icon */}
              <i 
                className="fas fa-share-alt" 
                onClick={() => setShowShareModal(true)} 
                style={{ cursor: 'pointer' }}
              ></i>
            </div>
          </div>
          <button className="add-to-cart-details-btn" onClick={addToCartHandler} disabled={material.countInStock === 0}>
            {material.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
      
      {/* Reviews Section - Kept exactly as your original code */}
      <div className="material-reviews-section">
        <h2>Customer Reviews ({material.numReviews})</h2>
        {material.reviews?.length === 0 && <p className="no-reviews-message">No reviews yet.</p>}
        <div className="reviews-list">
          {material.reviews?.map((review) => (
            <div key={review._id} className="review-card">
              <p className="review-author"><strong>{review.name}</strong></p>
              <div className="review-rating">Rating: {review.rating} / 5</div>
              <p className="review-comment">{review.comment}</p>
              <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
        
        <div className="review-form-container">
          <h3>Write a Customer Review</h3>
          {userInfo ? (
            hasReviewed ? (
              <p className="info-message">You have already reviewed this material.</p>
            ) : (
              <form onSubmit={submitReviewHandler}>
                <div className="form-group">
                  <label>Rating</label>
                  <select value={rating} onChange={(e) => setRating(Number(e.target.value))} required>
                    <option value="">Select...</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea rows="5" value={comment} onChange={(e) => setComment(e.target.value)} required></textarea>
                </div>
                <button type="submit" className="submit-review-btn" disabled={reviewLoading}>
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
                {reviewError && <p className="error-message">{reviewError}</p>}
              </form>
            )
          ) : (
            <p className="info-message">Please <Link to="/login">log in</Link> to write a review.</p>
          )}
        </div>
      </div>

      {/* ADDED: Simple Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)} style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
          <div className="share-modal-content" onClick={(e) => e.stopPropagation()} style={{background:'white', padding:'20px', borderRadius:'8px', textAlign:'center'}}>
            <h3>Share Material</h3>
            <button onClick={copyLinkToClipboard} className="share-option" style={{padding:'10px 20px', cursor:'pointer'}}>
              <i className="fas fa-link"></i> Copy Link
            </button>
            <br/><br/>
            <button onClick={() => setShowShareModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaterialDetailsPage;