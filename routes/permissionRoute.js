// routes/permissionRoute.js
import { Router } from 'express';
import permissionController from '../controllers/permissionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/permissions
router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "view"),
    (req, res, next) => permissionController.getAll(req, res, next)
);

// GET /api/permissions/:id
router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "view"),
    (req, res, next) => permissionController.getById(req, res, next)
);

// POST /api/permissions
router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "create"),
    (req, res, next) => permissionController.create(req, res, next)
);

// PUT /api/permissions/:id
router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "edit"),
    (req, res, next) => permissionController.update(req, res, next)
);

// PATCH /api/permissions/:id/bin
router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "delete"),
    (req, res, next) => permissionController.bin(req, res, next)
);

// PATCH /api/permissions/:id/restore
router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "delete"),
    (req, res, next) => permissionController.restore(req, res, next)
);

// DELETE /api/permissions/:id
router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "delete"),
    (req, res, next) => permissionController.delete(req, res, next)
);

export default router;