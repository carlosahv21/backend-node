// routes/roleRoute.js
import { Router } from 'express';
import roleController from '../controllers/roleController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/roles - Obtener todos los roles
router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("settings.roles", "view"),
    (req, res, next) => roleController.getAll(req, res, next)
);

// GET /api/roles/:id - Obtener un rol por ID
router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("settings.roles", "view"),
    (req, res, next) => roleController.getById(req, res, next)
);

// POST /api/roles - Crear un nuevo rol
router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("settings.roles", "create"),
    (req, res, next) => roleController.create(req, res, next)
);

// PUT /api/roles/:id - Actualizar un rol por ID
router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("settings.roles", "edit"),
    (req, res, next) => roleController.update(req, res, next)
);

// DELETE /api/roles/:id - Eliminar un rol por ID
router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("settings.roles", "delete"),
    (req, res, next) => roleController.delete(req, res, next)
);

export default router;