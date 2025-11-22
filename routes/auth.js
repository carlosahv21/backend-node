// routes/auth.js
const express = require("express");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * Rutas de Autenticación.
 */

// POST /api/auth/login
router.post("/login", 
    (req, res, next) => authController.login(req, res, next)
);

// GET /api/auth/me
router.get("/me", 
    authenticateToken, 
    (req, res, next) => authController.me(req, res, next)
);

module.exports = router;