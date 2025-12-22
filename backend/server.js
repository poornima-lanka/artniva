// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// 1. IMPORT ROUTES (Require mathrame vadali)
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes'); 
const materialRoutes = require('./routes/materialRoutes');
const cartRoutes = require('./routes/cartRoutes');
const shopRoutes = require('./routes/shopRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// 2. CONNECT DATABASE
connectDB();

// 3. INITIALIZE APP
const app = express();

// 4. MIDDLEWARE
app.use(express.json()); 
app.use(cors()); 

// 5. STATIC FILES (Images access avvalante idi correct ga undali)
// Backend folder lopala uploads unte idi perfect
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// 6. API ROUTES
app.get('/', (req, res) => {
  res.send('ArtNiva API is Running!');
});

// Ee routes order lo unnayani chusukondi
app.use('/api/materials', materialRoutes); // Material POST request ikkadiki vasthundi
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes); 
app.use('/api/cart', cartRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/upload', uploadRoutes);

// 7. ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

// 8. START SERVER
const PORT = process.env.PORT || 5000; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// --- HELPER FUNCTIONS ---
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