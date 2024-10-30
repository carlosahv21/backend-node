const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Ruta para obtener información del usuario autenticado
router.get("/profile", authenticateToken, (req, res) => {
  res.send(`Welcome ${req.user.name}!`);
});

module.exports = router;
