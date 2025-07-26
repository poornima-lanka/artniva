// frontend/src/components/Layout/Header.jsx
import React, { useState } from 'react'; // <--- Import useState
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './Header.css';

import artnivaLogo from '../../assets/images/artnivalogo.png';
import { useCart } from '../../context/CartContext'; 
// No props needed for Header now, as search logic is internal
function Header() {
  const { getTotalItems } = useCart();
   const totalCartItems = getTotalItems();
  const navigate = useNavigate();
  const { userInfo, logout, isLoggedIn, isSeller, isAdmin } = useUser();

  const [showSearchBar, setShowSearchBar] = useState(false); // <--- NEW: State for search bar visibility
  const [searchTerm, setSearchTerm] = useState(''); // <--- NEW: State for search input
  const [showShoppingDropdown, setShowShoppingDropdown] = useState(false);
  const logoutHandler = () => {
    logout();
    navigate('/login');
  };

  const handleSearchToggle = () => {
    setShowSearchBar(!showSearchBar); // Toggle visibility
    setSearchTerm(''); // Clear search term when hiding
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent page reload if this was inside a form
    if (searchTerm.trim()) {
      alert(`Performing search for: ${searchTerm}`); // Replace with actual search logic later
      // navigate(`/search?query=${searchTerm}`); // Example: navigate to search results page
      setShowSearchBar(false); // Hide search bar after search
      setSearchTerm(''); // Clear input
    }
  };

    const handleShoppingToggle = () => {
    setShowShoppingDropdown(!showShoppingDropdown);
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
            <span onClick={handleShoppingToggle}>Painting</span>
            
          </li>
          <li><Link to="/all-artworks">All Artworks</Link></li>
          {(isSeller || isAdmin) && (
            <li><Link to="/seller/dashboard">Seller Dashboard</Link></li>
          )}
          <li><Link to="/liked">Liked</Link></li>
          <li><Link to="/shopping">shopping</Link></li>
        </ul>
      </nav>
      <div className="icon-buttons">
        {/* --- MODIFIED: Search icon/input area --- */}
        <div className="search-container">
          {showSearchBar && (
            <form onSubmit={handleSearchSubmit} className="search-form-inline">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus // Focus when visible
              />
              <button type="submit" className="search-submit-btn">
                <i className="fas fa-search"></i>
              </button>
            </form>
          )}
          <button className="icon-btn search-toggle-btn" onClick={handleSearchToggle}>
            <i className="fas fa-search"></i>
          </button>
        </div>

        {/* Shopping Cart Icon with Count */}
        <Link to="/cart" className="icon-btn shopping-cart-icon"> {/* Link to your future CartPage */}
          <i className="fas fa-shopping-cart"></i> {/* Using your existing fas fa-shopping-cart icon */}
          {totalCartItems > 0 && <span className="cart-count">{getTotalItems()}</span>} {/* Display count if > 0 */}
        </Link>
        
        {isLoggedIn ? (
          <>
            {/* --- ESLINT FIX: Changed <a> to <Link> or simple <div> if not navigable --- */}
            {/* If the user-profile-link is always to /profile, <Link> is better. */}
            <Link to="/profile" className="icon-btn user-profile-link">
              <i className="fas fa-user-circle"></i>
              <span className="user-name">{userInfo.name}</span>
            </Link>

            {/* If it was a dropdown toggle for something else, a simple button/div is good */}
            {/* <button className="icon-btn user-profile-toggle" onClick={handleProfileClick}>
              <i className="fas fa-user-circle"></i>
              <span className="user-name">{userInfo.name}</span>
            </button> */}

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

