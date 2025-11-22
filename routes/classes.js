// routes/classes.js
const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');

// GET /api/classes
router.get("/",
    authenticateToken,
    authorize("classes", "view"),
    (req, res, next) => classController.getAll(req, res, next)
);

// GET /api/classes/:id
router.get("/:id",
    authenticateToken,
    authorize("classes", "view"),
    (req, res, next) => classController.getById(req, res, next)
);

// POST /api/classes
router.post("/",
    authenticateToken,
    authorize("classes", "create"),
    (req, res, next) => classController.create(req, res, next)
);

// PUT /api/classes/:id
router.put("/:id",
    authenticateToken,
    authorize("classes", "edit"),
    (req, res, next) => classController.update(req, res, next)
);

// DELETE /api/classes/:id
router.delete("/:id",
    authenticateToken,
    authorize("classes", "delete"),
    (req, res, next) => classController.delete(req, res, next)
);

module.exports = router;