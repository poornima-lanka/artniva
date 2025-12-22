import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
    // 1. STATE MANAGEMENT
    const [stats, setStats] = useState({ totalSellers: 0, totalCustomers: 0, pendingSellers: 0 });
    const [sellers, setSellers] = useState([]);
    // We now separate paintings and materials
    const [paintings, setPaintings] = useState([]);
    const [materials, setMaterials] = useState([]); 
    const [loading, setLoading] = useState(true);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // Configuration for authenticated requests
    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${userInfo?.token}` }
    }), [userInfo?.token]);

    // 2. FETCH DATA FROM BACKEND
    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch Users & Stats (Admin Only Routes)
            const { data: users } = await axios.get('http://localhost:5000/api/users', config);
            const { data: statsData } = await axios.get('http://localhost:5000/api/users/stats', config);
            
            // Fetch Inventory (Public Routes - assuming these exist)
            // Change these URLs if your backend routes are named differently
            const { data: paintingsData } = await axios.get('http://localhost:5000/api/products');
            const { data: materialsData } = await axios.get('http://localhost:5000/api/materials');

            setSellers(users.filter(u => u.role === 'seller'));
            setStats(statsData);
            setPaintings(paintingsData);
            setMaterials(materialsData); // Set materials data
            setLoading(false);
        } catch (error) {
            console.error("Dashboard Load Error", error);
            // Optional: Add alert("Failed to load dashboard data");
            setLoading(false);
        }
    }, [config]);

    // 3. HANDLE DELETE ACTION (The "Pro Tip")
    const handleDelete = async (id, type) => {
        // 'type' tells us if it's a 'product' (painting) or 'material'
        const confirmMessage = `Are you sure you want to permanently delete this ${type}?`;
        if (window.confirm(confirmMessage)) {
            try {
                // Determine the correct API endpoint based on type
                const endpoint = type === 'product' 
                    ? `http://localhost:5000/api/products/${id}`
                    : `http://localhost:5000/api/materials/${id}`;

                await axios.delete(endpoint, config);
                // Reload dashboard to show updated list
                loadDashboard(); 
                alert(`${type} deleted successfully.`);
            } catch (error) {
                console.error(`Error deleting ${type}`, error);
                alert(`Failed to delete ${type}. Ensure you have permission.`);
            }
        }
    };

    // 4. HANDLE SELLER VERIFICATION
    const handleVerify = async (id) => {
        if (window.confirm("Approve this artist to sell on ArtNiva?")) {
            try {
                await axios.put(`http://localhost:5000/api/users/${id}/verify`, {}, config);
                loadDashboard();
            } catch (error) {
                alert("Verification failed");
            }
        }
    };

    // Load data on component mount
    useEffect(() => { 
        loadDashboard(); 
    }, [loadDashboard]); 

    if (loading) return <div className="admin-container" style={{padding: "50px"}}>Loading Control Panel...</div>;

    return (
        <div className="admin-container">
            {/* --- SIDEBAR NAVIGATION --- */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>ArtNiva Control</h2>
                </div>
                <nav className="sidebar-nav">
                    <a href="#overview"><i className="fas fa-chart-line"></i> Overview</a>
                    <a href="#verifications"><i className="fas fa-user-check"></i> Verifications</a>
                    {/* UPDATED SIDEBAR LINKS */}
                    <a href="#paintings"><i className="fas fa-palette"></i> Paintings Items</a>
                    <a href="#materials"><i className="fas fa-tools"></i> Material Items</a>
                </nav>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="admin-main">
                <header className="admin-top-bar" id="overview">
                    <div className="welcome-text">
                        <h1>Dashboard Overview</h1>
                        <p>Welcome back, <strong>{userInfo?.name}</strong></p>
                    </div>
                    <div className="admin-badge">System Master</div>
                </header>

                {/* Stats Cards */}
                <section className="stats-grid">
                    <div className="glass-card stat-item">
                        <div className="stat-icon cust-icon"><i className="fas fa-users"></i></div>
                        <div className="stat-info">
                            <h3>Total Customers</h3>
                            <p>{stats.totalCustomers || 0}</p>
                        </div>
                    </div>
                    <div className="glass-card stat-item">
                        <div className="stat-icon seller-icon"><i className="fas fa-store"></i></div>
                        <div className="stat-info">
                            <h3>Total Sellers</h3>
                            <p>{stats.totalSellers || 0}</p>
                        </div>
                    </div>
                    <div className="glass-card stat-item">
                        <div className="stat-icon pending-icon"><i className="fas fa-clock"></i></div>
                        <div className="stat-info">
                            <h3>Pending Requests</h3>
                            <p>{stats.pendingSellers || 0}</p>
                        </div>
                    </div>
                </section>

                {/* Seller Verifications */}
                <section id="verifications" className="admin-content-section">
                    <div className="section-header">
                        <h2>Seller Verification Requests</h2>
                    </div>
                    <div className="glass-card table-wrapper">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Artist Name</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellers.map(seller => (
                                    <tr key={seller._id}>
                                        <td><div className="user-name-cell">{seller.name}</div></td>
                                        <td>{seller.email}</td>
                                        <td>
                                            <span className={`badge ${seller.isVerifiedSeller ? 'b-success' : 'b-warning'}`}>
                                                {seller.isVerifiedSeller ? "Verified" : "Waiting"}
                                            </span>
                                        </td>
                                        <td>
                                            {!seller.isVerifiedSeller && (
                                                <button onClick={() => handleVerify(seller._id)} className="action-btn approve">
                                                    Verify Artist
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* --- PAINTINGS INVENTORY SECTION --- */}
                <section id="paintings" className="admin-content-section">
                    <div className="section-header">
                        <h2>Artwork (Paintings) Inventory</h2>
                    </div>
                    <div className="inventory-grid">
                        {paintings.length === 0 ? <p>No paintings found.</p> : paintings.map(item => (
                            <div key={item._id} className="glass-card product-admin-card">
                                <img src={item.image} alt={item.name} />
                                <div className="p-details">
                                    <h4>{item.name}</h4>
                                    <p>By: {item.artist || 'Unknown'}</p>
                                    <p>Stock: <span className={item.countInStock < 2 ? 'low-stock' : ''}>{item.countInStock}</span></p>
                                    {/* DELETE BUTTON - Passes 'product' type */}
                                    <button onClick={() => handleDelete(item._id, 'product')} className="delete-btn-icon">
                                        <i className="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- MATERIALS INVENTORY SECTION --- */}
                <section id="materials" className="admin-content-section">
                    <div className="section-header">
                        <h2>Art Materials Inventory</h2>
                    </div>
                    <div className="inventory-grid">
                        {materials.length === 0 ? <p>No materials found.</p> : materials.map(item => (
                            <div key={item._id} className="glass-card product-admin-card">
                                {/* Assuming materials also have an image property */}
                                <img src={item.image || 'placeholder.jpg'} alt={item.name} />
                                <div className="p-details">
                                    <h4>{item.name}</h4>
                                    <p>Category: {item.category || 'Material'}</p>
                                    <p>Stock: <span className={item.countInStock < 5 ? 'low-stock' : ''}>{item.countInStock}</span></p>
                                    {/* DELETE BUTTON - Passes 'material' type */}
                                    <button onClick={() => handleDelete(item._id, 'material')} className="delete-btn-icon">
                                        <i className="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}

export default AdminDashboard;