const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product'); 
const { protect, seller } = require('../middleware/authMiddleware'); // Imported correctly
const router = express.Router();

// 1. SETUP MULTER STORAGE
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// 2. THE CREATE PRODUCT ROUTE
// Added 'seller' middleware here to protect your marketplace
router.post('/', protect, seller, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category, countInStock } = req.body;

    // This ensures the path is saved as /uploads/image-xxx.jpg
    const imagePath = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : '';

    const product = new Product({
      name,
      price,
      description,
      category,
      countInStock,
      image: imagePath, 
      seller: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. GET ALL PRODUCTS
router.get('/', async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

// 4. GET SINGLE PRODUCT BY ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: "Invalid Product ID format" });
  }
});

module.exports = router;