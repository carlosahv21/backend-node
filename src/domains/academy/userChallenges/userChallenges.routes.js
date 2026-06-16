import { Router } from 'express';
import userChallengesController from './userChallenges.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "view"),
    (req, res, next) => userChallengesController.getAll(req, res, next)
);

router.get("/user/:userId",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "view"),
    (req, res, next) => userChallengesController.getByUser(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "view"),
    (req, res, next) => userChallengesController.getById(req, res, next)
);

router.post("/join/:challengeId",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "create"),
    (req, res, next) => userChallengesController.join(req, res, next)
);

router.delete("/leave/:challengeId",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "delete"),
    (req, res, next) => userChallengesController.leave(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("challenges", "delete"),
    (req, res, next) => userChallengesController.delete(req, res, next)
);

export default router;