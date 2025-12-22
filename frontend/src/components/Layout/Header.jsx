import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './Header.css';
import SearchBox from '../SearchBox/SearchBox'; // Your modular search component

import artnivaLogo from '../../assets/images/artnivalogo.png';
import { useCart } from '../../context/CartContext'; 

function Header() {
  const { getTotalItems } = useCart();
  const totalCartItems = getTotalItems();
  const navigate = useNavigate();
  const { userInfo, logout, isLoggedIn, isSeller, isAdmin } = useUser();

  const [showShoppingDropdown, setShowShoppingDropdown] = useState(false);

  const logoutHandler = () => {
    logout();
    navigate('/login');
  };

  

  return (
    <header className="main-header">
      <div className="logo">
        <Link to="/">
          <img src={artnivaLogo} alt="Artniva Logo" />
          <span>Artniva</span>
        </Link>
      </div>

      <nav className="nav-links">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li 
            className="shopping-dropdown-link" 
            onMouseEnter={() => setShowShoppingDropdown(true)}
            onMouseLeave={() => setShowShoppingDropdown(false)}
          >
            {/* Navigates to materials list */}
            <Link to="/art-materials">Material</Link>
          </li>
          <li><Link to="/all-artworks">Paintings</Link></li>
          {(isSeller || isAdmin) && (
            <li><Link to="/seller/dashboard">Seller Dashboard</Link></li>
          )}
          <li><Link to="/liked">Liked</Link></li>
          <li><Link to="/shopping">shopping</Link></li>
        </ul>
      </nav>

      <div className="icon-buttons">
        {/* --- IMPROVED: Using your SearchBox component here --- */}
        <SearchBox /> 

        {/* Shopping Cart Icon with Count */}
        <Link to="/cart" className="icon-btn shopping-cart-icon">
          <i className="fas fa-shopping-cart"></i>
          {totalCartItems > 0 && <span className="cart-count">{totalCartItems}</span>}
        </Link>
        
        {isLoggedIn ? (
          <>
            <Link to="/profile" className="icon-btn user-profile-link">
              <i className="fas fa-user-circle"></i>
              <span className="user-name">{userInfo.name}</span>
            </Link>

            <button onClick={logoutHandler} className="sign-in-btn">
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/login" className="sign-in-btn">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;