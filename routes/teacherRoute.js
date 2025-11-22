// routes/teacherRoute.js
import { Router } from 'express';
import teacherController from '../controllers/teacherController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/teachers
router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teachers", "view"),
    (req, res, next) => teacherController.getAll(req, res, next)
);

// GET /api/teachers/:id
router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teachers", "view"),
    (req, res, next) => teacherController.getById(req, res, next)
);

// POST /api/teachers
router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teachers", "create"),
    (req, res, next) => teacherController.create(req, res, next)
);

// PUT /api/teachers/:id
router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teachers", "edit"),
    (req, res, next) => teacherController.update(req, res, next)
);

// DELETE /api/teachers/:id
router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("teachers", "delete"),
    (req, res, next) => teacherController.delete(req, res, next)
);

export default router;