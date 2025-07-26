// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path'); // Make sure this is at the t
// Import your routes

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes'); // For general products (paintings)
const materialRoutes = require('./routes/materialRoutes'); // Dedicated routes for materials
const cartRoutes = require('./routes/cartRoutes');
const shopRoutes = require('./routes/shopRoutes'); // For combined shop items
// Connect to database
connectDB();

// --- DEFINE 'app' FIRST ---
const app = express();
// --- END DEFINE 'app' ---

const PORT = process.env.PORT || 5000;

// Middleware for parsing JSON and CORS, and serving static files
app.use(express.json()); // To parse JSON request bodies
app.use(cors()); // To allow cross-origin requests

// Serve static files from the 'public' folder (for general frontend assets)
app.use(express.static('public'));

// --- NOW, SERVE YOUR UPLOADS FOLDER ---
// This makes files in 'backend/uploads' accessible via '/uploads' URL prefix
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// --- END UPLOADS SERVING ---

// Basic route
app.get('/', (req, res) => {
  res.send('ArtNiva API is Running!');
});

// API Routes (Make sure these come after all app.use middleware)
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes); // This will now typically be for artworks/general products
app.use('/api/materials', materialRoutes); // Dedicated route for materials
app.use('/api/cart', cartRoutes);
app.use('/api/shop', shopRoutes);

// Error Handling Middleware (MUST be after all routes)
app.use(notFound); // Ensure notFound and errorHandler are imported/defined
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});

// Make sure your notFound and errorHandler functions are correctly defined
// (e.g., in middleware/errorMiddleware.js and imported, or defined directly)
function notFound(req, res, next) {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

function errorHandler(err, req, res, next) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
}