// backend/routes/shopRoutes.js
const express = require('express');
const router = express.Router();
const { getCombinedShopItems } = require('../controllers/artworksController');

router.route('/').get(getCombinedShopItems);

module.exports = router;