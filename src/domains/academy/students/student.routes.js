import { Router } from 'express';
import studentController from './student.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "view"),
    (req, res, next) => studentController.getAll(req, res, next)
);

router.get("/details/:id",
    authMiddleware.authenticateToken,
    (req, res, next) => studentController.getByIdDetails(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "view"),
    (req, res, next) => studentController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "create"),
    (req, res, next) => studentController.create(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "edit"),
    (req, res, next) => studentController.update(req, res, next)
);

router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "delete"),
    (req, res, next) => studentController.bin(req, res, next)
);

router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "delete"),
    (req, res, next) => studentController.restore(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "delete"),
    (req, res, next) => studentController.delete(req, res, next)
);

export default router;