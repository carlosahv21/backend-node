const express = require("express");
const { login, me } = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");


const router = express.Router();

// Ruta de login
router.post("/login", login);

// Ruta para obtener info del usuario con token
router.get("/me", authenticateToken , me);

module.exports = router;
