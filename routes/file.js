// routes/file.js
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');

// POST /api/files/upload
router.post("/upload", 
    authenticateToken, 
    authorize("files", "edit"), 
    (req, res, next) => fileController.uploadLogo(req, res, next)
);

// DELETE /api/files/remove
router.delete("/remove", 
    authenticateToken, 
    authorize("files", "edit"), 
    (req, res, next) => fileController.removeFile(req, res, next)
);

module.exports = router;