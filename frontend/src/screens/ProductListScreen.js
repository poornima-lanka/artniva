import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; 
// NOTE: This screen currently only lists products and has a button to create new ones.
// Full CRUD (Edit/Delete) functionality will be added later.

function ProductListScreen() {
    // 🚨 CORRECTED LINE: Removed 'isLoggedIn' 🚨
    const { userInfo } = useUser(); 
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Placeholder for your admin token (REPLACE THIS in a real app)
    // In a real application, you would get the token from local storage after login.
    // For now, let's use the token you got from Thunder Client.
    // const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; 

    useEffect(() => {
        // Fetch all products to display to the admin
        const fetchProducts = async () => {
            try {
                // Note: Even though this is an admin screen, the GET /api/products route is PUBLIC
                const { data } = await axios.get('https://artniva.onrender.com/api/products');
                setProducts(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch products. Check if backend is running.');
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const createProductHandler = () => {
        // Navigate to the product creation screen
        navigate('/admin/product/create');
    };

    // NOTE: This is a placeholder for the delete functionality which is protected.
    const deleteHandler = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };

                // This is the protected DELETE route that only admins can hit
                await axios.delete(`https://artniva.onrender.com/api/products/${productId}`, config);

                // Refetch products to update the list
                setProducts(products.filter(p => p._id !== productId));
                alert('Product Deleted!');

            } catch (error) {
                setError(error.response.data.message || 'Failed to delete product. Are you logged in as Admin?');
            }
        }
    };

    return (
        <div className="container">
            <h2>Admin Product Management</h2>
            <button className="btn btn-primary mb-3" onClick={createProductHandler}>
                + Create New Product
            </button>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Price (₹)</th>
                            <th>Category</th>
                            <th>In Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td>{product._id.substring(18)}</td>
                                <td>{product.name}</td>
                                <td>{product.price.toFixed(2)}</td>
                                <td>{product.category}</td>
                                <td>{product.countInStock}</td>
                                <td>
                                    {/* Navigate to edit screen later */}
                                    <button className="btn btn-sm btn-info me-2">Edit</button>
                                    <button 
                                        className="btn btn-sm btn-danger" 
                                        onClick={() => deleteHandler(product._id)}
                                        >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ProductListScreen;