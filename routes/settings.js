// routes/settings.js
const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');

// GET /api/settings
router.get("/", 
    authenticateToken, 
    authorize("settings", "view"), 
    (req, res, next) => settingController.getSettings(req, res, next)
);

// PUT /api/settings
router.put("/", 
    authenticateToken, 
    authorize("settings", "edit"), 
    (req, res, next) => settingController.updateSettings(req, res, next)
);

module.exports = router;