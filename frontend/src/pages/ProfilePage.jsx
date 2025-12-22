import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './ProfilePage.css';

function ProfilePage() {
  const { userInfo, isSeller, isAdmin, isCustomer } = useUser();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  if (!userInfo) return null;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
           <h1>ACCOUNT</h1>
        </header>

        {/* --- USER IDENTITY SECTION --- */}
        <div className="user-info-section">
          <div className="profile-avatar"><i className="fas fa-user-circle"></i></div>
          <h2 className="username">{userInfo.name}</h2>
          <p className="user-email">{userInfo.email}</p>
          
          {/* Badge color varies by role */}
          <div className={`role-badge role-${userInfo.role}`}>
             {userInfo.role?.toUpperCase()}
          </div>
          
          {/* Seller Status (Only for Sellers) */}
          {userInfo.role === 'seller' && (
            <p className={`verify-status ${userInfo.isVerifiedSeller ? 'text-success' : 'text-warning'}`}>
               {userInfo.isVerifiedSeller ? "✅ Verified Artist" : "⏳ Pending Approval"}
            </p>
          )}
        </div>

        <div className="profile-sections">
          {/* --- MANAGEMENT SECTION (For Admins & Verified Sellers) --- */}
          {(isAdmin || (isSeller && userInfo.isVerifiedSeller)) && (
            <div className="section dashboard-links">
              <h3>Management</h3>
              <ul className="btn-list">
                {isAdmin && (
                  <li>
                    <Link to="/admin/dashboard" className="btn-dash admin-btn">
                       Go to Admin Control Panel
                    </Link>
                  </li>
                )}
                
                {(isSeller && userInfo.isVerifiedSeller) && (
                  <li>
                    <Link to="/seller/dashboard" className="btn-dash seller-btn">
                       Go to Seller Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* --- CUSTOMER SECTION --- */}
          {isCustomer && (
            <div className="section">
              <h3>Shopping Activity</h3>
              <ul className="activity-list">
                <li><Link to="/profile/order-history">Order History</Link></li>
                <li><Link to="/liked">My Wishlist</Link></li>
                <li><Link to="/cart">My Cart</Link></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;