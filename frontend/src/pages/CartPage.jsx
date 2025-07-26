// frontend/src/pages/CartPage.jsx
import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import '../pages/CartPage.css';

const CartPage = () => {
  const { cartItems, fetchCartItems } = useCart();
  const navigate = useNavigate();

  const calculateTotalCost = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  // Helper to safely get the actual product/material object for display,
  // and its ID for API calls.
  // Assumes item.product is either a populated object or the ID string.
  const getProductDetails = (item) => {
    let actualProduct = null;
    let productId = null;
    let name = item.name; // Fallback to item.name if not populated
    let image = item.image; // Fallback to item.image if not populated
    let price = item.price; // Fallback to item.price if not populated

    if (item.product && typeof item.product === 'object' && item.product._id) {
      // It's populated with a product object
      actualProduct = item.product;
      productId = item.product._id;
      name = item.product.name || name; // Use populated name, fallback to item.name
      image = item.product.image || item.product.imageUrl || image; // Use populated image, fallback
      price = item.product.price || price; // Use populated price, fallback
    } else if (typeof item.product === 'string') {
      // It's not populated, `item.product` is just the ID string
      productId = item.product;
      // In this case, 'name', 'image', 'price' *must* come from the cart item itself
      // This means your backend MUST return these fields directly on the cart item if not populating
    } else {
      // Fallback for cases where item.product might be null/undefined
      console.warn("Cart item 'product' field not structured as expected:", item);
      productId = item._id; // Try to use the cart item's _id as a last resort for removal, but this is less ideal for general product/material display.
    }
    
    // For materials, your backend might populate `material` field
    // Add similar logic for `item.material` if your cart schema uses that
    if (item.material && typeof item.material === 'object' && item.material._id) {
      actualProduct = item.material;
      productId = item.material._id;
      name = item.material.name || name;
      image = item.material.image || item.material.imageUrl || image;
      price = item.material.price || price;
    } else if (typeof item.material === 'string') {
      productId = item.material;
    }


    // Ensure we always return an ID for API calls
    if (!productId && item._id) { // If _id is directly on the cart item
      productId = item._id;
    }
    
    return { actualProduct, productId, name, image, price };
  };


  const handleRemoveItem = async (productId, itemType) => {
    console.log("--- handleRemoveItem Called ---");
    console.log("  Attempting to remove item with:");
    console.log("  productId:", productId);
    console.log("  itemType:", itemType);

    if (!productId || !itemType) {
        alert("Missing product ID or item type for removal. Please check console for details.");
        console.error("handleRemoveItem: Missing productId or itemType.", { productId, itemType });
        return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        alert("Please log in to remove items.");
        console.error("handleRemoveItem: User not logged in.");
        return;
      }
      const token = userInfo.token;

      console.log(`Sending DELETE request to: http://localhost:5000/api/cart/${productId}`);
      console.log(`DELETE Request Body: ${JSON.stringify({ itemType })}`);

      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error response for DELETE:", errorData);
        throw new Error(errorData.message || 'Failed to remove item from cart.');
      }

      console.log(`Item ${productId} of type ${itemType} removed successfully! Backend response OK.`);
      fetchCartItems();
    } catch (error) {
      console.error('Final Error in handleRemoveItem:', error);
      alert(`Error removing item: ${error.message}`);
    }
    console.log("--- handleRemoveItem Finished ---");
  };

  const handleQuantityChange = async (productId, itemType, newQuantity) => {
      console.log("--- handleQuantityChange Called ---");
      console.log("  Attempting to change quantity for:");
      console.log("  productId:", productId);
      console.log("  itemType:", itemType);
      console.log("  newQuantity:", newQuantity);

      if (typeof newQuantity !== 'number' || newQuantity < 0 || isNaN(newQuantity)) {
          alert("Invalid quantity value. Please check console for details.");
          console.error("handleQuantityChange: Invalid newQuantity.", { newQuantity });
          return;
      }

      if (newQuantity === 0) {
          handleRemoveItem(productId, itemType);
          return;
      }
      if (!productId || !itemType) {
          alert("Missing product ID or item type for quantity update. Please check console for details.");
          console.error("handleQuantityChange: Missing productId or itemType.", { productId, itemType });
          return;
      }

      try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
          if (!userInfo || !userInfo.token) {
              alert("Please log in to update cart.");
              console.error("handleQuantityChange: User not logged in.");
              return;
          }
          const token = userInfo.token;

          console.log(`Sending PUT request to: http://localhost:5000/api/cart/${productId}`);
          console.log(`PUT Request Body: ${JSON.stringify({ quantity: newQuantity, itemType })}`);

          const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ quantity: newQuantity, itemType })
          });

          if (!response.ok) {
              const errorData = await response.json();
              console.error("Backend error response for PUT:", errorData);
              throw new Error(errorData.message || 'Failed to update item quantity.');
          }

          console.log(`Item ${productId} quantity updated to ${newQuantity}! Backend response OK.`);
          fetchCartItems();
      } catch (error) {
          console.error('Final Error in handleQuantityChange:', error);
          alert(`Error updating quantity: ${error.message}`);
      }
      console.log("--- handleQuantityChange Finished ---");
  };

  const handleBuyNow = async () => {
    console.log("--- handleBuyNow Called ---");
    if (cartItems.length === 0) {
        alert("Your cart is empty. Please add items before purchasing.");
        return;
    }

    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
            alert("Please log in to place an order.");
            console.error("handleBuyNow: User not logged in.");
            return;
        }
        const token = userInfo.token;

        console.log("Attempting to clear cart (simulated purchase) via DELETE /api/cart");
        const response = await fetch('http://localhost:5000/api/cart', {
            method: 'DELETE', // This endpoint clears the whole cart
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend error response for clearing cart after purchase:", errorData);
            throw new Error(errorData.message || 'Failed to clear cart after purchase.');
        }

        console.log("Cart cleared successfully after simulated purchase.");
        fetchCartItems(); // Update frontend cart state to empty
        navigate('/order-placed');
    } catch (error) {
        console.error('Final Error during simulated purchase:', error);
        alert(`Error placing order: ${error.message}`);
    }
    console.log("--- handleBuyNow Finished ---");
  };

  return (
    <div className="cart-page-container">
      <h2>Your Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart-message">Your cart is empty. Start shopping now!</p>
      ) : (
        <div className="cart-items-list">
          {cartItems.map((item) => {
            // Get the product details dynamically
            const { productId, name, image, price } = getProductDetails(item);

            // Important check: if productId is null, this item is malformed or unidentifiable
            if (!productId) {
              console.warn("Skipping malformed cart item:", item);
              return null; // Skip rendering this item
            }

            return (
              <div key={item._id} className="cart-item-card">
                {/* Use the dynamically extracted image and name */}
                <img src={image} alt={name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{name}</h3>
                  <p>Price: ₹{price?.toFixed(2) || 'N/A'}</p> {/* Use optional chaining for price */}
                  <div className="cart-item-quantity-controls">
                    <button onClick={() => handleQuantityChange(productId, item.itemType, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(productId, item.itemType, item.quantity + 1)}>+</button>
                  </div>
                  <p>Subtotal: ₹{((price || 0) * item.quantity).toFixed(2)}</p> {/* Use price with fallback */}
                  <button
                    className="remove-item-button"
                    onClick={() => handleRemoveItem(productId, item.itemType)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
          <div className="cart-summary">
            <h3>Total Cost: ₹{calculateTotalCost()}</h3>
            <button className="buy-now-button" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;