// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');

// GET /api/users
router.get("/",
    authenticateToken,
    authorize("users", "view"),
    (req, res, next) => userController.getAll(req, res, next) // Añadimos 'next'
);

// GET /api/users/:id
router.get("/:id",
    authenticateToken,
    authorize("users", "view"),
    (req, res, next) => userController.getById(req, res, next) // Añadimos 'next'
);

// POST /api/users
router.post("/",
    authenticateToken,
    authorize("users", "create"),
    (req, res, next) => userController.create(req, res, next) // Añadimos 'next'
);

// PUT /api/users/:id
router.put("/:id",
    authenticateToken,
    authorize("users", "edit"),
    (req, res, next) => userController.update(req, res, next) // Añadimos 'next'
);

// DELETE /api/users/:id
router.delete("/:id",
    authenticateToken,
    authorize("users", "delete"),
    (req, res, next) => userController.delete(req, res, next) // Añadimos 'next'
);

module.exports = router;