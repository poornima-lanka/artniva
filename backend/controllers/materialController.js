const asyncHandler = require('express-async-handler');
const Material = require('../models/Material');

// @desc    Create a new material
// @route   POST /api/materials
// @access  Private
// backend/controllers/materialController.js

const createMaterial = asyncHandler(async (req, res) => {
    const { name, price, description, countInStock, category, seller } = req.body;

    const material = new Material({
        name,
        price,
        description,
        countInStock, // Frontend lo ide peru tho pampisthunnam
        category,
        seller,
        image: req.file ? `/uploads/${req.file.filename}` : '',
    });

    const createdMaterial = await material.save();
    res.status(201).json(createdMaterial);
});

// @desc    Fetch all materials
const getMaterials = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword ? {
        name: { $regex: req.query.keyword, $options: 'i' },
    } : {};
    const materials = await Material.find({ ...keyword });
    res.json(materials);
});

// @desc    Fetch single material
const getMaterialById = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (material) {
        res.json(material);
    } else {
        res.status(404);
        throw new Error('Material not found');
    }
});

// @desc    Toggle like
const likeMaterial = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (material) {
        const isLiked = material.likes.some((like) => like.toString() === req.user._id.toString());
        if (isLiked) { material.likes.pull(req.user._id); } 
        else { material.likes.push(req.user._id); }
        await material.save();
        res.status(200).json(material);
    } else {
        res.status(404); throw new Error('Material not found');
    }
});

// @desc    Create review
const createMaterialReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const material = await Material.findById(req.params.id);
    if (material) {
        const review = { name: req.user.name, rating: Number(rating), comment, user: req.user._id };
        material.reviews.push(review);
        material.numReviews = material.reviews.length;
        material.rating = material.reviews.reduce((acc, item) => item.rating + acc, 0) / material.reviews.length;
        await material.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404); throw new Error('Material not found');
    }
});

module.exports = {
    getMaterials,
    getMaterialById,
    likeMaterial,
    createMaterialReview,
    createMaterial, 
};