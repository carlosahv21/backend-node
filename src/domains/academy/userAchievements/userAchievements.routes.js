import { Router } from 'express';
import userAchievementsController from './userAchievements.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("achievements", "view"),
    (req, res, next) => userAchievementsController.getAll(req, res, next)
);

router.get("/user/:userId",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("achievements", "view"),
    (req, res, next) => userAchievementsController.getByUser(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("achievements", "view"),
    (req, res, next) => userAchievementsController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("achievements", "create"),
    (req, res, next) => userAchievementsController.create(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("achievements", "delete"),
    (req, res, next) => userAchievementsController.delete(req, res, next)
);

export default router;