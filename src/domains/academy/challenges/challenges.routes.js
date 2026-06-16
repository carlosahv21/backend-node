import { Router } from 'express';
import challengesController from './challenges.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "view"),
    (req, res, next) => challengesController.getAll(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "view"),
    (req, res, next) => challengesController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "create"),
    (req, res, next) => challengesController.create(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "edit"),
    (req, res, next) => challengesController.update(req, res, next)
);

router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "delete"),
    (req, res, next) => challengesController.bin(req, res, next)
);

router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "delete"),
    (req, res, next) => challengesController.restore(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "delete"),
    (req, res, next) => challengesController.delete(req, res, next)
);

export default router;