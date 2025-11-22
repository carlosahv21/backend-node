// routes/fields.js
const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');

// GET /api/fields (Obtener todos los campos con paginación/filtros)
router.get("/",
    authenticateToken,
    authorize("fields", "view"),
    (req, res, next) => fieldController.getAll(req, res, next)
);

// GET /api/fields/:id
router.get("/:id",
    authenticateToken,
    authorize("fields", "view"),
    (req, res, next) => fieldController.getById(req, res, next)
);

// POST /api/fields
router.post("/",
    authenticateToken,
    authorize("fields", "create"),
    (req, res, next) => fieldController.create(req, res, next)
);

// PUT /api/fields/:id
router.put("/:id",
    authenticateToken,
    authorize("fields", "edit"),
    (req, res, next) => fieldController.update(req, res, next)
);

// DELETE /api/fields/:id
router.delete("/:id",
    authenticateToken,
    authorize("fields", "delete"),
    (req, res, next) => fieldController.delete(req, res, next)
);


// GET /api/fields/module/:id
router.get("/module/:id",
    authenticateToken,
    authorize("fields", "view"),
    (req, res, next) => fieldController.getFieldsByModule(req, res, next)
);

module.exports = router;