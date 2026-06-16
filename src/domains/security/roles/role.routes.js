import { Router } from 'express';
import roleController from './role.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("roles", "view"),
    (req, res, next) => roleController.getAll(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("roles", "view"),
    (req, res, next) => roleController.getById(req, res, next)
);

router.get("/details/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("roles", "view"),
    (req, res, next) => roleController.getByIdDetails(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("roles", "create"),
    (req, res, next) => roleController.create(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("roles", "edit"),
    (req, res, next) => roleController.update(req, res, next)
);

router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("roles", "delete"),
    (req, res, next) => roleController.bin(req, res, next)
);

router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("roles", "delete"),
    (req, res, next) => roleController.restore(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("roles", "delete"),
    (req, res, next) => roleController.delete(req, res, next)
);

export default router;