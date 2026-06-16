import { Router } from 'express';
import achievementsController from './achievements.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("achievements", "view"),
    (req, res, next) => achievementsController.getAll(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("achievements", "view"),
    (req, res, next) => achievementsController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("achievements", "create"),
    (req, res, next) => achievementsController.create(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("achievements", "edit"),
    (req, res, next) => achievementsController.update(req, res, next)
);

router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("achievements", "delete"),
    (req, res, next) => achievementsController.bin(req, res, next)
);

router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("achievements", "delete"),
    (req, res, next) => achievementsController.restore(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("achievements", "delete"),
    (req, res, next) => achievementsController.delete(req, res, next)
);

export default router;