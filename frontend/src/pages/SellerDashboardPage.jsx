import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import './SellerDashboardPage.css';

function SellerDashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [inventoryItems, setInventoryItems] = useState([]); // Products + Materials rendu ikkada untayi
    const [loading, setLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '', price: '', category: 'Painting', description: '', countInStock: ''
    });
    const [imageFile, setImageFile] = useState(null);

    const userInfo = useMemo(() => {
        const savedUser = localStorage.getItem('userInfo');
        return savedUser ? JSON.parse(savedUser) : null;
    }, []);

    // FIX 1: Fetch both Products and Materials for Inventory
    const loadSellerData = useCallback(async () => {
        if (!userInfo?._id) return;
        try {
            setLoading(true);
            const [productsRes, materialsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/products'),
                axios.get('http://localhost:5000/api/materials')
            ]);

            // Combine and filter by seller ID
            const myProducts = productsRes.data.filter(p => p.seller === userInfo._id);
            const myMaterials = materialsRes.data.filter(m => m.seller === userInfo._id);
            
            setInventoryItems([...myProducts, ...myMaterials]); 
        } catch (error) {
            console.error("Error loading seller data", error);
        } finally {
            setLoading(false);
        }
    }, [userInfo?._id]);

    useEffect(() => { 
        if (userInfo?._id) { loadSellerData(); }
    }, [loadSellerData, userInfo?._id]);

    // IMAGE RESOLVER: Same logic used in ArtMaterialsPage
    const getImageUrl = (item) => {
        let path = item?.image || item?.imageUrl || "";
        if (!path) return "https://placehold.co/300x200?text=No+Image";
        const cleanPath = path.replace(/\\/g, '/');
        const fileName = cleanPath.split('/').pop();

        // Local Files (Port 3000)
        const localImages = ['abstract_dreams.jpg', 'acrylic_paint.jpg', 'acrylic_raining.jpg', 'bird_watercolor.jpg', 'canvas_art.jpg', 'snow_watercolor.jpg', 'waterworld.png'];
        if (localImages.includes(fileName)) return `/images/${fileName}`;

        // Backend Files (Port 5000)
        if (cleanPath.includes('uploads/')) {
            return `http://localhost:5000${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
        }
        return `http://localhost:5000/uploads/${fileName}`;
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) return alert("Please upload an image!");

        setIsPublishing(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append('name', formData.name);
            dataToSend.append('price', formData.price);
            dataToSend.append('description', formData.description);
            dataToSend.append('countInStock', formData.countInStock);
            dataToSend.append('image', imageFile);
            dataToSend.append('seller', userInfo._id);

            // FIX 2: Dynamic Category and Endpoint
            let endpoint = '';
            if (activeTab === 'add-material') {
                dataToSend.append('category', 'Material'); // Force Category for Materials
                endpoint = 'http://localhost:5000/api/materials';
            } else {
                dataToSend.append('category', 'Painting'); // Default for Products
                endpoint = 'http://localhost:5000/api/products';
            }

            const uploadConfig = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };

            await axios.post(endpoint, dataToSend, uploadConfig);
            
            alert("Item added successfully!");
            setFormData({ name: '', price: '', category: 'Painting', description: '', countInStock: '' });
            setImageFile(null);
            setIsPublishing(false);
            setActiveTab('inventory'); 
            loadSellerData();
        } catch (error) {
            setIsPublishing(false);
            console.error(error);
            alert("Upload failed. Make sure Backend is running and routes are correct.");
        }
    };

    if (!userInfo) return <div className="seller-loading">Login Required.</div>;
    if (loading) return <div className="seller-loading">Updating Studio...</div>;

    return (
        <div className="admin-container"> 
            <aside className="admin-sidebar seller-sidebar">
                <div className="sidebar-header">
                    <h2>Seller Studio</h2>
                    <p>{userInfo.name}</p>
                    <span className="status-badge">Verified Artist</span>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
                    <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>My Inventory</button>
                    <button className={activeTab === 'add-painting' ? 'active' : ''} onClick={() => setActiveTab('add-painting')}>Add Painting</button>
                    <button className={activeTab === 'add-material' ? 'active' : ''} onClick={() => setActiveTab('add-material')}>Add Materials</button>
                </nav>
            </aside>

            <main className="admin-main">
                {activeTab === 'overview' && (
                    <div className="tab-content">
                        <h1>Sales Analytics</h1>
                        <div className="stats-grid">
                            <div className="glass-card stat-item">
                                <h3>Total Items</h3>
                                <p className="big-number">{inventoryItems.length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="tab-content">
                        <h1>Your Shop Listings ({inventoryItems.length})</h1>
                        <div className="inventory-grid">
                            {inventoryItems.length === 0 ? (
                                <p className="empty-msg">No items found.</p>
                            ) : (
                                inventoryItems.map(item => (
                                    <div key={item._id} className="glass-card product-admin-card">
                                        {/* FIX 3: Using Universal Image Logic */}
                                        <img src={getImageUrl(item)} alt={item.name} />
                                        <div className="p-details">
                                            <h4>{item.name}</h4>
                                            <span className="cat-badge">{item.category}</span>
                                            <p className="price-tag">₹{item.price}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {(activeTab === 'add-painting' || activeTab === 'add-material') && (
                    <div className="tab-content">
                        <h1>{activeTab === 'add-painting' ? 'Upload New Artwork' : 'List Art Supplies'}</h1>
                        <form className="glass-card modern-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <input type="text" name="name" placeholder="Item Name" value={formData.name} onChange={handleInputChange} required />
                                <input type="number" name="price" placeholder="Price (₹)" value={formData.price} onChange={handleInputChange} required />
                                <input type="number" name="countInStock" placeholder="Stock Quantity" value={formData.countInStock} onChange={handleInputChange} required />
                                
                                <div className="upload-container">
                                    <label htmlFor="file-upload" className="custom-file-upload">
                                        {imageFile ? `Selected: ${imageFile.name}` : "Click to Choose Image"}
                                    </label>
                                    <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} required />
                                </div>

                                <textarea name="description" placeholder="Describe your item..." value={formData.description} onChange={handleInputChange} required></textarea>
                            </div>
                            <button type="submit" className="submit-btn" disabled={isPublishing}>
                                {isPublishing ? "Publishing..." : "Publish to Marketplace"}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}

export default SellerDashboardPage;