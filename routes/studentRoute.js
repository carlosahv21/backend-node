// routes/student.route.js
import { Router } from 'express';
import studentController from '../controllers/studentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateModule } from '../middlewares/dynamicValidationMiddleware.js';

const router = Router();
// GET /api/students
router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "view"),
    (req, res, next) => studentController.getAll(req, res, next) // Añadimos 'next'
);

// GET /api/students/:id
router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "view"),
    (req, res, next) => studentController.getById(req, res, next) // Añadimos 'next'
);

// GET /api/students/details/:id
router.get("/details/:id",
    authMiddleware.authenticateToken,
    (req, res, next) => studentController.getByIdDetails(req, res, next) // Añadimos 'next'
);

// POST /api/students
router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "create"),
    validateModule('users'),
    (req, res, next) => studentController.create(req, res, next) // Añadimos 'next'
);

// PUT /api/students/:id
router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "edit"),
    (req, res, next) => studentController.update(req, res, next) // Añadimos 'next'
);

// PATCH /api/students/:id/bin
router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "delete"),
    (req, res, next) => studentController.bin(req, res, next)
);

// PATCH /api/students/:id/restore
router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "delete"),
    (req, res, next) => studentController.restore(req, res, next)
);

// DELETE /api/students/:id
router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("students", "delete"),
    (req, res, next) => studentController.delete(req, res, next) // Añadimos 'next'
);

export default router;
