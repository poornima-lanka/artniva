// frontend/src/pages/ProfilePage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './ProfilePage.css'; // Ensure this CSS file exists and contains the styles I provided earlier

function ProfilePage() {
  const { userInfo, isSeller, isAdmin, isCustomer } = useUser(); // Destructure isCustomer
  const navigate = useNavigate();

  if (!userInfo) {
    navigate('/login');
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>ACCOUNT</h1>

        <div className="user-info-section">
          <div className="profile-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <h2 className="username">{userInfo.name}</h2>
          <p className="user-email">{userInfo.email}</p>
          <p className="user-role">Role: {userInfo.role}</p>
        </div>

        <div className="profile-sections">

          {/* Customer-Specific Sections */}
          {isCustomer && (
            <>
              {/* My Orders Section */}
              <div className="section">
                <h3>My Orders</h3>
                <ul>
                  <li><Link to="/profile/bank-upi-details">Bank & UPI details</Link></li>
                  <li><Link to="/profile/payments-refund">Payments & refund</Link></li>
                  <li><Link to="/profile/order-history">Order History</Link></li> {/* New: Order History */}
                  <li><Link to="/profile/upcoming-orders">Upcoming Orders</Link></li> {/* New: Upcoming Orders */}
                </ul>
              </div>

              {/* Saved Items (Wishlist/Liked) */}
              <div className="section">
                <h3>My Saved Items</h3>
                <ul>
                  <li><Link to="/liked">Wishlisted Products</Link></li> {/* Uses existing /liked route */}
                  {/* You can add more saved item categories if needed */}
                </ul>
              </div>

              {/* Activity Section - Customer specific */}
              <div className="section">
                <h3>Activity</h3>
                <ul>
                  <li><Link to="/profile/change-language">Change Language</Link></li>
                  <li><Link to="/profile/shared-products">Shared Products</Link></li>
                  <li><Link to="/profile/notes-and-recommendations">My Notes & Recommendations</Link></li> {/* New: Notes feature */}
                </ul>
              </div>
            </>
          )}

          {/* Seller/Admin Specific Sections */}
          {(isSeller || isAdmin) && (
            <div className="section seller-section">
              <h3>Seller Actions</h3>
              <ul>
                <li>
                  <Link to="/seller/dashboard">Seller Dashboard</Link>
                </li>
                {/* You can add more seller-specific links here, e.g., */}
                {/* <li><Link to="/seller/add-product">Add New Product</Link></li> */}
                {/* <li><Link to="/seller/manage-orders">Manage Orders</Link></li> */}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;