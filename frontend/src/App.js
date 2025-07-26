
// frontend/src/App.js
import React from 'react'; // <--- No useState needed here anymore for search
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
// import Layout from './components/Layout/Layout'; // Keep this line removed/commented out
import HomePage from './pages/HomePage';
import AllArtworksPage from './pages/AllArtworksPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import SellerDashboardPage from './pages/SellerDashboardPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage'; // <--- Import the new CartPage
import OrderPlacedPage from './pages/OrderPlacedPage';
import Header from './components/Layout/Header'; // Keep this import
import Footer from './components/Layout/Footer'; // Keep this import
import ArtMaterialsPage from './pages/ArtMaterialsPage'; // <--- NEW IMPORT
import { CartProvider } from './context/CartContext';
import ProductDetailsPage from './pages/ProductDetailsPage'; // Add this line
import MaterialDetailsPage from './pages/MaterialDetailsPage';
import LikedArtworksPage from './pages/LikedArtworksPage'; 
import Combinedpage from './pages/Combinedpage';
function App() {
  // REMOVE THESE LINES: isSearchOpen state and toggleSearch function are now in Header.jsx
  // const [isSearchOpen, setIsSearchOpen] = useState(false);
  // const toggleSearch = () => {
  //   setIsSearchOpen(!isSearchOpen);
  // };

  return (
    <Router>
       <CartProvider>
      <UserProvider>
        {/* CRITICAL: Render Header directly here. Pass no props related to search. */}
        <Header /> {/* <--- This must be uncommented and present */}

        <main> {/* Use <main> tag directly for your content */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/all-artworks" element={<AllArtworksPage />} />
             <Route path="/art-materials" element={<ArtMaterialsPage />} />
             <Route path="/materials/:id" element={<MaterialDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/liked" element={<LikedArtworksPage />} />
            <Route path="/shopping" element={<Combinedpage />} />
             <Route path="/cart" element={<CartPage />} /> {/* <--- New Cart Route */}
              <Route path="/order-placed" element={<OrderPlacedPage />} /> 
              <Route path="/material/:id" element={<MaterialDetailsPage />} /> {/* Add this line */}
              <Route path="/artwork/:id" element={<ProductDetailsPage />} /> {/* Add this line */}
            <Route element={<ProtectedRoute allowedRoles={['seller', 'admin']} />}>
              <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
            </Route>
          </Routes>
        </main>

        <Footer /> {/* Footer rendered directly */}
        
        {/* REMOVE THIS LINE: SearchOverlay is no longer rendered here */}
        {/* {isSearchOpen && <SearchOverlay onClose={toggleSearch} />} */}
      </UserProvider>
      </CartProvider>
    </Router>
  );
}

export default App;