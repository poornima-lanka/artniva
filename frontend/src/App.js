// frontend/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Layout Components
import Header from './components/Layout/Header'; 
import Footer from './components/Layout/Footer'; 

// Contexts
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';

// Utility/Auth
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import AllArtworksPage from './pages/AllArtworksPage';
import ArtMaterialsPage from './pages/ArtMaterialsPage'; 
import ProductDetailsPage from './pages/ProductDetailsPage'; 
import MaterialDetailsPage from './pages/MaterialDetailsPage';
import Combinedpage from './pages/Combinedpage'; // Assuming this is for shopping
import LikedArtworksPage from './pages/LikedArtworksPage'; 

// Auth/User Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage'; 
import OrderPlacedPage from './pages/OrderPlacedPage';

// Admin/Seller Pages (The new focus)
import SellerDashboardPage from './pages/SellerDashboardPage';
// NOTE: I am assuming your screen folder is named 'screens' (plural) as per common React convention.
// If your folder is named 'screen', please change the path below.
import ProductListScreen from './screens/ProductListScreen'; // Corrected folder name
import ProductCreateScreen from './screens/ProductCreateScreen'; // Corrected folder name

import ForgotPasswordScreen from './screens/ForgotPasswordScreen'; // <-- NEW IMPORT
import ResetPasswordScreen from './screens/ResetPasswordScreen'; // <-- NEW IMPORT
import AdminDashboard from './pages/AdminDashboard';


function App() {
  return (
    <CartProvider>
      <UserProvider>
        <Header /> 

        {/* Added a style to main to prevent the Fixed Header from covering content */}
        <main style={{ paddingTop: '80px', minHeight: '80vh' }}> 
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/all-artworks" element={<AllArtworksPage />} />
            <Route path="/art-materials" element={<ArtMaterialsPage />} />
            <Route path="/artwork/:id" element={<ProductDetailsPage />} /> 
            <Route path="/materials/:id" element={<MaterialDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgotpassword" element={<ForgotPasswordScreen />} />
            <Route path="/resetpassword/:token" element={<ResetPasswordScreen />} />

            {/* --- User Routes (Requires Login) --- */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/liked" element={<LikedArtworksPage />} />
            <Route path="/shopping" element={<Combinedpage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-placed" element={<OrderPlacedPage />} /> 

            {/* --- Seller Protected Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['seller', 'admin']} />}>
              <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
            </Route>
            
            {/* --- Admin Protected Routes (MOVE DASHBOARD HERE) --- */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* MOVED HERE */}
                <Route path="/admin/products" element={<ProductListScreen />} />
                <Route path="/admin/product/create" element={<ProductCreateScreen />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<h1>404 Page Not Found</h1>} />
          </Routes>
        </main>

        <Footer /> 
      </UserProvider>
    </CartProvider>
  );
}
export default App;