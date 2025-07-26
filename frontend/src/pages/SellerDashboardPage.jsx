// frontend/src/pages/SellerDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext'; // To display user info
import axios from 'axios'; // We'll use axios to fetch seller's products

function SellerDashboardPage() {
  const { userInfo } = useUser(); // Get user info from context
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch seller's products when the component mounts or userInfo changes
    const fetchSellerProducts = async () => {
      if (!userInfo || (userInfo.role !== 'seller' && userInfo.role !== 'admin')) {
        setError('You are not authorized to view this page.');
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`, // Send the user's token
          },
        };
        // Call the backend endpoint for seller's own products
        const { data } = await axios.get('http://localhost:5000/api/products/myproducts', config);
        setSellerProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch products');
        setLoading(false);
      }
    };

    fetchSellerProducts();
  }, [userInfo]); // Re-run effect if userInfo changes

  return (
    <div className="seller-dashboard-page" style={{ padding: '20px' }}>
      <h1>{userInfo ? `${userInfo.name}'s Seller Dashboard` : 'Seller Dashboard'}</h1>
      <p>This is where sellers can manage their products.</p>

      <h2 style={{ marginTop: '30px' }}>Your Products</h2>
      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : sellerProducts.length === 0 ? (
        <p>You have no products yet. Add your first artwork!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {sellerProducts.map((product) => (
            <div key={product._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>{product.name}</h3>
              <p>Price: ${product.price}</p>
              <p>Category: {product.category}</p>
              {product.image && (
                <img
                  src={`http://localhost:5000${product.image}`} // Ensure path is correct for your backend serving static files
                  alt={product.name}
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', marginTop: '10px' }}
                />
              )}
              {/* Add Edit/Delete buttons here later */}
            </div>
          ))}
        </div>
      )}

      {/* You can add a button to "Add New Product" here later */}
      <button style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Add New Product
      </button>
    </div>
  );
}

export default SellerDashboardPage;