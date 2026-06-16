import { Router } from 'express';
import moduleController from './module.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "view"),
    (req, res, next) => moduleController.getAll(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "view"),
    (req, res, next) => moduleController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "create"),
    (req, res, next) => moduleController.create(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "edit"),
    (req, res, next) => moduleController.update(req, res, next)
);

router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "delete"),
    (req, res, next) => moduleController.bin(req, res, next)
);

router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "delete"),
    (req, res, next) => moduleController.restore(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "delete"),
    (req, res, next) => moduleController.delete(req, res, next)
);

router.put("/toggle/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "edit"),
    (req, res, next) => moduleController.toggle(req, res, next)
);

export default router;