const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// 1. Setup where the images should be saved
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // This saves images in a folder named 'uploads'
  },
  filename(req, file, cb) {
    // This gives the file a unique name based on the date
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// 2. The route that receives the file from your Seller Dashboard
router.post('/', upload.single('image'), (req, res) => {
  res.send(`/${req.file.path}`); // This sends the local path back to your frontend
});

module.exports = router;