import React, { useState, useEffect, useCallback } from 'react';
import MaterialCard from '../components/MaterialCard/MaterialCard';
import BannerCarousel from '../components/BannerCarousel/BannerCarousel';
import './ArtMaterialsPage.css';
import { useCart } from '../context/CartContext';

const BACKEND_URL = "https://artniva.onrender.com";

function ArtMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState(null);
  const { fetchCartItems } = useCart();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const getImageUrl = (item) => {
  let path = item?.image || item?.imageUrl || "";
  if (!path) return "https://placehold.co/300x200?text=No+Path";
  if (path.startsWith('http')) return path;

  const cleanPath = path.replace(/\\/g, '/');
  const fileName = cleanPath.split('/').pop();

  // 1. Check for local public/images folder (Port 3000)
  // Meeru pampina screenshots lo "abstract_dreams.jpg" lanti files ikkada unnay
  const localImages = [
    'abstract_dreams.jpg', 'acrylic_paint.jpg', 'acrylic_raining.jpg', 
    'bird_watercolor.jpg', 'canvas_art.jpg', 'snow_watercolor.jpg', 'waterworld.png'
  ];

  if (localImages.includes(fileName)) {
    return `${window.location.origin}/images/${fileName}`;
  }

  // 2. Dashboard nunchi add chesina files (Port 5000 Uploads)
  // "uploads/" prefix lekapothe add chesthundhi
  if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('/uploads/')) {
    const uploadPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${BACKEND_URL}${uploadPath}`;
  }

  // Default case: direct ga backend ki pampisthundhi
  return `${BACKEND_URL}/${cleanPath}`;
};

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/materials`);
      const data = await response.json();
      console.log("Database Items:", data); // Check if all items are coming
      setMaterials(data);
    } catch (err) {
      console.error("Failed to fetch materials:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const addToCartHandler = async (material) => {
    if (!userInfo?.token) return alert("Please log in.");
    try {
      const res = await fetch(`${BACKEND_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userInfo.token}` },
        body: JSON.stringify({ productId: material._id, quantity: 1, itemType: 'Material' })
      });
      if (res.ok) {
        setCartMessage(`${material.name} added to cart!`);
        fetchCartItems();
        setTimeout(() => setCartMessage(null), 3000);
      }
    } catch (error) { console.error(error); }
  };

  const likeMaterialHandler = async (materialId) => {
    if (!userInfo?.token) return alert("Please log in.");
    try {
      const response = await fetch(`${BACKEND_URL}/api/materials/${materialId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userInfo.token}` },
      });
      if (response.ok) fetchMaterials();
    } catch (error) { console.error(error); }
  };

  // BROAD FILTER: Database lo unna anni items display cheyadaniki
  const displayItems = materials; 

  if (loading) return <div className="art-materials-page">Loading...</div>;

  return (
    <div className="art-materials-page">
      <BannerCarousel />
      <h1 style={{textAlign: 'center', margin: '20px 0'}}>All Art Materials</h1>
      
      {cartMessage && <p style={{ color: 'green', textAlign: 'center', fontWeight: 'bold' }}>{cartMessage}</p>}

      <div className="materials-grid">
        {displayItems.length > 0 ? (
          displayItems.map((m) => (
            <MaterialCard 
              key={m._id} 
              material={{ ...m, imageUrl: getImageUrl(m) }} 
              addToCartHandler={() => addToCartHandler(m)} 
              likeMaterialHandler={() => likeMaterialHandler(m._id)} 
            />
          ))
        ) : (
          <div style={{textAlign: 'center', padding: '20px'}}>
             <p>No materials found in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArtMaterialsPage;