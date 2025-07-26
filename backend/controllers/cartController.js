// backend/controllers/cartController.js

const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Material = require('../models/Material'); // Import Material model
const Product = require('../models/Product');   // Import Product (Artwork) model - Assuming your artwork model is named 'Product'

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    console.log("Backend: GET /api/cart request received.");
    console.log("Backend: User from token (req.user):", req.user);

    if (!req.user || !req.user._id) {
        console.log("Backend: No user ID found in token for GET /api/cart.");
        return res.status(401).json({ message: 'Not authorized, no user ID found' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product');

    console.log("Backend: Found cart object (before checking if null):", cart);

    if (cart) {
        console.log("Backend: Cart items found:", cart.cartItems);
        res.status(200).json({ items: cart.cartItems });
    } else {
        console.log("Backend: No cart found for this specific user. Returning empty array.");
        res.status(200).json({ items: [] });
    }
});

// @desc    Add item to cart or update quantity if it exists
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, itemType } = req.body; // itemType will be 'Material' or 'Product'

  // Input validation
  if (!productId || !quantity || !itemType) {
    res.status(400);
    throw new Error('Please provide productId, quantity, and itemType.');
  }
  if (quantity <= 0) {
    res.status(400);
    throw new Error('Quantity must be a positive number.');
  }
  if (!['Material', 'Product'].includes(itemType)) {
    res.status(400);
    throw new Error('Invalid itemType. Must be "Material" or "Product".');
  }

  let itemDetails;
  if (itemType === 'Material') {
    itemDetails = await Material.findById(productId);
  } else if (itemType === 'Product') { // Assuming 'Product' is your Artwork model
    itemDetails = await Product.findById(productId);
  }

  if (!itemDetails) {
    res.status(404);
    throw new Error('Product or Material not found.');
  }

  // Check if enough stock is available
  if (itemDetails.stock < quantity) {
    res.status(400);
    throw new Error(`Not enough stock available for ${itemDetails.name}. Available: ${itemDetails.stock}`);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    // Cart exists for user
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.itemType === itemType
    );

    if (itemIndex > -1) {
      // Item already exists in cart, update quantity
      cart.cartItems[itemIndex].quantity += quantity;
      // You might want to re-check stock after updating quantity
      if (itemDetails.stock < cart.cartItems[itemIndex].quantity) {
          res.status(400);
          throw new Error(`Adding ${quantity} to cart would exceed stock for ${itemDetails.name}. Total in cart: ${cart.cartItems[itemIndex].quantity - quantity}, Available: ${itemDetails.stock}`);
      }
    } else {
      // Item does not exist in cart, add new item
      cart.cartItems.push({
        product: productId,
        itemType,
        name: itemDetails.name,
        imageUrl: itemDetails.imageUrl,
        price: itemDetails.price,
        quantity,
      });
    }
    cart.updatedAt = Date.now(); // Manually update updatedAt if not using timestamps on subdocs
    cart = await cart.save();
    // Populate product details after saving for the response
    await cart.populate('cartItems.product');
    res.status(200).json(cart);
  } else {
    // No cart exists for user, create a new one
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{
        product: productId,
        itemType,
        name: itemDetails.name,
        imageUrl: itemDetails.imageUrl,
        price: itemDetails.price,
        quantity,
      }],
    });
    // Populate product details after saving for the response
    await cart.populate('cartItems.product');
    res.status(201).json(cart);
  }
});

// @desc    Update quantity of a specific item in cart
// @route   PUT /api/cart/:id (id is the productId)
// @access  Private
const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { quantity, itemType } = req.body;
  const productId = req.params.id; // Product ID from URL param

  if (!quantity || quantity <= 0 || !itemType) {
    res.status(400);
    throw new Error('Please provide a valid quantity and itemType.');
  }
  if (!['Material', 'Product'].includes(itemType)) {
    res.status(400);
    throw new Error('Invalid itemType. Must be "Material" or "Product".');
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found for this user.');
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item.product.toString() === productId && item.itemType === itemType
  );

  if (itemIndex > -1) {
    // Item found in cart
    const itemInCart = cart.cartItems[itemIndex];
    let productInDb;
    if (itemType === 'Material') {
      productInDb = await Material.findById(productId);
    } else {
      productInDb = await Product.findById(productId);
    }

    if (!productInDb) {
        res.status(404);
        throw new Error('Product or Material not found in database.');
    }

    if (productInDb.stock < quantity) {
        res.status(400);
        throw new Error(`Cannot update: Not enough stock for ${productInDb.name}. Available: ${productInDb.stock}`);
    }

    itemInCart.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    await cart.populate('cartItems.product');
    res.json(cart);
  } else {
    res.status(404);
    throw new Error('Item not found in cart.');
  }
});

// @desc    Remove specific item from cart
// @route   DELETE /api/cart/:id (id is the productId)
// @access  Private
const removeCartItem = asyncHandler(async (req, res) => {
  const productId = req.params.id; // Product ID from URL param
  const { itemType } = req.body; // Need itemType to ensure correct item removal if IDs overlap

  if (!itemType || !['Material', 'Product'].includes(itemType)) {
      res.status(400);
      throw new Error('Invalid itemType for removal.');
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found for this user.');
  }

  // Filter out the item to be removed
  const initialLength = cart.cartItems.length;
  cart.cartItems = cart.cartItems.filter(
    (item) => !(item.product.toString() === productId && item.itemType === itemType)
  );

  if (cart.cartItems.length === initialLength) {
    res.status(404);
    throw new Error('Item not found in cart.');
  }

  cart.updatedAt = Date.now();
  await cart.save();
  await cart.populate('cartItems.product');
  res.json(cart);
});

// @desc    Clear user's entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.cartItems = []; // Empty the cart items array
    cart.updatedAt = Date.now();
    await cart.save();
    res.status(200).json({ message: 'Cart cleared successfully', cart });
  } else {
    res.status(404);
    throw new Error('Cart not found for this user.');
  }
});

// This module.exports MUST be at the end of the file,
// after all functions (getCart, addToCart, etc.) are defined.
module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};