// frontend/src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCartItems = localStorage.getItem('cartItems');
      return storedCartItems ? JSON.parse(storedCartItems) : [];
    } catch (error) {
      console.error("Failed to parse cart items from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const fetchCartItems = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        setCartItems([]);
        return;
      }
      const token = userInfo.token;

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 204) {
          console.log("Cart is empty or not found for user.");
          setCartItems([]);
          return;
        }
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }

      const data = await response.json();
      // --- IMPORTANT CHANGE: Now we consistently expect 'data.items' ---
      setCartItems(data.items || []); // Simplified: expects data to have an 'items' array
      console.log('Cart fetched from backend (GET /api/cart):', data.items || []);

    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const contextValue = {
    cartItems,
    getTotalItems,
    fetchCartItems,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};