// routes/routes.js
const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// GET /api/routes

router.get("/", 
    authenticateToken, 
    (req, res, next) => routeController.getRoutes(req, res, next)
);

module.exports = router;