// routes/fieldRoute.js
import { Router } from 'express';
import fieldController from '../controllers/fieldController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/fields
router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "view"),
    (req, res, next) => fieldController.getAll(req, res, next)
);

// GET /api/fields/:id
router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "view"),
    (req, res, next) => fieldController.getById(req, res, next)
);

// GET /api/fields/module/:id
router.get("/module/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "view"),
    (req, res, next) => fieldController.getFieldsByModule(req, res, next)
);

// GET /api/fields/relation
router.post("/relation",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "view"),
    (req, res, next) => fieldController.getRelationField(req, res, next)
);

// POST /api/fields
router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "create"),
    (req, res, next) => fieldController.create(req, res, next)
);

// PUT /api/fields/:id
router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "edit"),
    (req, res, next) => fieldController.update(req, res, next)
);

// PATCH /api/fields/:id/bin
router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "delete"),
    (req, res, next) => fieldController.bin(req, res, next)
);

// PATCH /api/fields/:id/restore
router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "delete"),
    (req, res, next) => fieldController.restore(req, res, next)
);

// DELETE /api/fields/:id
router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "delete"),
    (req, res, next) => fieldController.delete(req, res, next)
);

export default router;