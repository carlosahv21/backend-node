import { Router } from 'express';
import academyController from './academy.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';
import { registerLimiter } from '../../../shared/middlewares/rateLimiter.js';

const router = Router();

router.post("/register",
    registerLimiter,
    (req, res, next) => academyController.registerAcademy(req, res, next)
);

router.get("/me",
    authMiddleware.authenticateToken,
    (req, res, next) => academyController.getMyAcademy(req, res, next)
);

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("academies", "view"),
    (req, res, next) => academyController.getAllAcademies(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("academies", "view"),
    (req, res, next) => academyController.getAcademyById(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("academies", "edit"),
    (req, res, next) => academyController.updateAcademy(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("academies", "delete"),
    (req, res, next) => academyController.deleteAcademy(req, res, next)
);

export default router;