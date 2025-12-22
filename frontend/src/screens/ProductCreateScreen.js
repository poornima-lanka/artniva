import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function ProductCreateScreen() {
    // 🚨 CORRECTED LINE: Removed 'isLoggedIn' as it is not used 🚨
    const { userInfo } = useUser(); 
    

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Painting');
    const [countInStock, setCountInStock] = useState(0);
    const [artistName, setArtistName] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [medium, setMedium] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Placeholder for your admin token (REPLACE THIS in a real app)
    // const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; 

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            // The fields sent to the backend
            const productData = {
                name, price, image, description, category, countInStock,
                // Include painting-specific fields only if the category is 'Painting'
                ...(category === 'Painting' && { artistName, dimensions, medium }),
            };

            // This is the protected POST route that only admins can hit
            const { data } = await axios.post('https://artniva.onrender.com/api/products', productData, config);

            setMessage(`Product "${data.name}" Created Successfully!`);

            // Clear form or redirect
            setTimeout(() => {
                navigate('/admin/products');
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Product creation failed. Check network/server or token.');
        }
    };

    const isPainting = category === 'Painting';

    return (
        <div className="container">
            <button className='btn btn-light' onClick={() => navigate('/admin/products')}>
                Go Back
            </button>
            <h2>Create Product</h2>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={submitHandler} className="form-grid">

                {/* Basic Fields */}
                <div>
                    <label>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Price (₹)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div>
                    <label>Image URL</label>
                    <input type="text" value={image} onChange={(e) => setImage(e.target.value)} required />
                </div>
                <div>
                    <label>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                </div>
                <div>
                    <label>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                        <option value="Painting">Painting</option>
                        <option value="Drawing Tool">Drawing Tool</option>
                        <option value="Canvas">Canvas</option>
                    </select>
                </div>
                <div>
                    <label>Count In Stock</label>
                    <input type="number" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required />
                </div>

                {/* Painting Specific Fields (Conditional Render) */}
                {isPainting && (
                    <>
                    <div>
                        <label>Artist Name</label>
                        <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} required={isPainting} />
                    </div>
                    <div>
                        <label>Dimensions (e.g., 24x36 inches)</label>
                        <input type="text" value={dimensions} onChange={(e) => setDimensions(e.target.value)} required={isPainting} />
                    </div>
                    <div>
                        <label>Medium (e.g., Oil on Canvas)</label>
                        <input type="text" value={medium} onChange={(e) => setMedium(e.target.value)} required={isPainting} />
                    </div>
                    </>
                )}

                <button type="submit" className="btn-submit">
                    Create Product
                </button>
            </form>
        </div>
    );
}

export default ProductCreateScreen;