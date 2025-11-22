// routes/permissions.js
const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');

// Rutas CRUD Estándar
// Se asume que la gestión de permisos es una acción privilegiada, por lo que requieren autenticación y autorización.

// GET /api/permissions
router.get("/", 
    authenticateToken, 
    authorize("permissions", "view"), 
    (req, res, next) => permissionController.getAll(req, res, next)
);

// GET /api/permissions/:id
router.get("/:id", 
    authenticateToken, 
    authorize("permissions", "view"), 
    (req, res, next) => permissionController.getById(req, res, next)
);

// POST /api/permissions
router.post("/", 
    authenticateToken, 
    authorize("permissions", "create"), 
    (req, res, next) => permissionController.create(req, res, next)
);

// PUT /api/permissions/:id
router.put("/:id", 
    authenticateToken, 
    authorize("permissions", "edit"), 
    (req, res, next) => permissionController.update(req, res, next)
);

// DELETE /api/permissions/:id
router.delete("/:id", 
    authenticateToken, 
    authorize("permissions", "delete"), 
    (req, res, next) => permissionController.delete(req, res, next)
);

module.exports = router;