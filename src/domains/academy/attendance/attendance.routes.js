import { Router } from 'express';
import attendanceController from './attendance.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "view"),
    (req, res, next) => attendanceController.getAll(req, res, next)
);

router.get("/class/:class_id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "view"),
    (req, res, next) => attendanceController.getByClass(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "view"),
    (req, res, next) => attendanceController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "create"),
    (req, res, next) => attendanceController.create(req, res, next)
);

router.post("/bulk",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "create"),
    (req, res, next) => attendanceController.bulkCreateOrUpdate(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "delete"),
    (req, res, next) => attendanceController.delete(req, res, next)
);

export default router;