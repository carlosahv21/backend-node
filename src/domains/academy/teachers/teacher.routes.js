import { Router } from 'express';
import teacherController from './teacher.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teachers", "view"),
    (req, res, next) => teacherController.getAll(req, res, next)
);

router.get("/details/:id",
    authMiddleware.authenticateToken,
    (req, res, next) => teacherController.getByIdDetails(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teachers", "view"),
    (req, res, next) => teacherController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teachers", "create"),
    (req, res, next) => teacherController.create(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teachers", "edit"),
    (req, res, next) => teacherController.update(req, res, next)
);

router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teachers", "delete"),
    (req, res, next) => teacherController.bin(req, res, next)
);

router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teachers", "delete"),
    (req, res, next) => teacherController.restore(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teachers", "delete"),
    (req, res, next) => teacherController.delete(req, res, next)
);

export default router;