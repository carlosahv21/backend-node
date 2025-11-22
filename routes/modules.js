// routes/modules.js
const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');

// Rutas CRUD Estándar
router.get("/",
    authenticateToken,
    authorize("modules", "view"),
    (req, res, next) => moduleController.getAll(req, res, next)
);

router.get("/:id",
    authenticateToken,
    authorize("modules", "view"),
    (req, res, next) => moduleController.getById(req, res, next)
);

router.post("/",
    authenticateToken,
    authorize("modules", "create"),
    (req, res, next) => moduleController.create(req, res, next)
);

router.put("/:id",
    authenticateToken,
    authorize("modules", "edit"),
    (req, res, next) => moduleController.update(req, res, next)
);

router.delete("/:id",
    authenticateToken,
    authorize("modules", "delete"),
    (req, res, next) => moduleController.delete(req, res, next)
);


// --- Ruta Especializada ---

// PUT /api/modules/toggle/:id
// Alterna el estado activo/inactivo del módulo
router.put("/toggle/:id",
    authenticateToken,
    authorize("modules", "edit"), // Normalmente se necesita permiso de edición para esto
    (req, res, next) => moduleController.toggle(req, res, next)
);

module.exports = router;