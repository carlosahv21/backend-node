import { Router } from 'express';
import permissionController from './permission.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "view"),
    (req, res, next) => permissionController.getAll(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "view"),
    (req, res, next) => permissionController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "create"),
    (req, res, next) => permissionController.create(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "edit"),
    (req, res, next) => permissionController.update(req, res, next)
);

router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "delete"),
    (req, res, next) => permissionController.bin(req, res, next)
);

router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "delete"),
    (req, res, next) => permissionController.restore(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "delete"),
    (req, res, next) => permissionController.delete(req, res, next)
);

export default router;