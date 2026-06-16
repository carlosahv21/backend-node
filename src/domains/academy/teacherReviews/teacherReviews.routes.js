import { Router } from 'express';
import teacherReviewsController from './teacherReviews.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teacher_reviews", "view"),
    (req, res, next) => teacherReviewsController.getAll(req, res, next)
);

router.get("/teacher/:teacherId",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teacher_reviews", "view"),
    (req, res, next) => teacherReviewsController.getByTeacher(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teacher_reviews", "view"),
    (req, res, next) => teacherReviewsController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teacher_reviews", "create"),
    (req, res, next) => teacherReviewsController.create(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teacher_reviews", "edit"),
    (req, res, next) => teacherReviewsController.update(req, res, next)
);

router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teacher_reviews", "delete"),
    (req, res, next) => teacherReviewsController.bin(req, res, next)
);

router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teacher_reviews", "delete"),
    (req, res, next) => teacherReviewsController.restore(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teacher_reviews", "delete"),
    (req, res, next) => teacherReviewsController.delete(req, res, next)
);

export default router;