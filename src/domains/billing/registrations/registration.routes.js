import { Router } from 'express';
import registrationController from './registration.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("registrations", "view"),
    (req, res, next) => registrationController.getAll(req, res, next)
);

router.get("/list",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("registrations", "view"),
    (req, res, next) => registrationController.getGroupedByStudent(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("registrations", "view"),
    (req, res, next) => registrationController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("registrations", "create"),
    (req, res, next) => registrationController.create(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("registrations", "delete"),
    (req, res, next) => registrationController.delete(req, res, next)
);

export default router;