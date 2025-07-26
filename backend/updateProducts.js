// backend/updateProducts.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully for script');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const updateOldProducts = async () => {
  await connectDB();
  
  try {
    // Find all products that do not have the 'likes' field
    const productsToUpdate = await Product.find({ likes: { $exists: false } });

    if (productsToUpdate.length === 0) {
      console.log('All existing products already have a likes array. No update needed.');
      return;
    }
    
    console.log(`Found ${productsToUpdate.length} products without a likes array. Updating...`);

    for (const product of productsToUpdate) {
      product.likes = []; // Add an empty likes array
      await product.save();
    }

    console.log('Successfully updated all old products with an empty likes array!');
  } catch (error) {
    console.error(`Error updating products: ${error.message}`);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
};

updateOldProducts();