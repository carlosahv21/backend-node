// routes/fieldRoute.js
import { Router } from 'express';
import fieldController from '../controllers/fieldController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/fields (Obtener todos los campos con paginación/filtros)
router.get("/",
    authMiddleware.authenticateToken,
    (req, res, next) => fieldController.getAll(req, res, next)
);

// GET /api/fields/:id
router.get("/:id",
    authMiddleware.authenticateToken,
    (req, res, next) => fieldController.getById(req, res, next)
);

// POST /api/fields
router.post("/",
    authMiddleware.authenticateToken,
    (req, res, next) => fieldController.create(req, res, next)
);

// PUT /api/fields/:id
router.put("/:id",
    authMiddleware.authenticateToken,
    (req, res, next) => fieldController.update(req, res, next)
);

// DELETE /api/fields/:id
router.delete("/:id",
    authMiddleware.authenticateToken,
    (req, res, next) => fieldController.delete(req, res, next)
);

// GET /api/fields/module/:id
router.get("/module/:id",
    authMiddleware.authenticateToken,
    (req, res, next) => fieldController.getFieldsByModule(req, res, next)
);

export default router;