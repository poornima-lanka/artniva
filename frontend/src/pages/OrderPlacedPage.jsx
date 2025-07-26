// frontend/src/pages/OrderPlacedPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../pages/OrderPlacedPage.css'; // We'll create this CSS file

const OrderPlacedPage = () => {
  return (
    <div className="order-placed-container">
      <h2>🎉 Order Placed Successfully! 🎉</h2>
      <p>Thank you for your purchase. Your order details have been sent to your email address.</p>
      <p>We appreciate your business!</p>
      <div className="order-placed-actions">
        <Link to="/" className="continue-shopping-button">Continue Shopping</Link>
        {/* You might want a link to "My Orders" if you implement that feature */}
        {/* <Link to="/my-orders" className="view-orders-button">View My Orders</Link> */}
      </div>
    </div>
  );
};

export default OrderPlacedPage;