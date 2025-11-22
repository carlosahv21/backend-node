// routes/roles.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');

// GET /api/roles
router.get("/", 
    authenticateToken, 
    authorize("roles", "view"), 
    (req, res, next) => roleController.getAll(req, res, next)
);

// GET /api/roles/:id
router.get("/:id", 
    authenticateToken, 
    authorize("roles", "view"), 
    (req, res, next) => roleController.getById(req, res, next)
);

// POST /api/roles
router.post("/", 
    authenticateToken, 
    authorize("roles", "create"), 
    (req, res, next) => roleController.create(req, res, next)
);

// PUT /api/roles/:id
router.put("/:id", 
    authenticateToken, 
    authorize("roles", "edit"), 
    (req, res, next) => roleController.update(req, res, next)
);

// DELETE /api/roles/:id
router.delete("/:id", 
    authenticateToken, 
    authorize("roles", "delete"), 
    (req, res, next) => roleController.delete(req, res, next)
);

module.exports = router;