// routes/users.js
import { Router } from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validateSchema from '../middlewares/validationMiddleware.js';
import { createUserSchema } from '../validators/Schemas.js';

const router = Router();
// GET /api/users
router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "view"),
    (req, res, next) => userController.getAll(req, res, next) // Añadimos 'next'
);

// GET /api/users/:id
router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "view"),
    (req, res, next) => userController.getById(req, res, next) // Añadimos 'next'
);

// POST /api/users
router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "create"),
    validateSchema(createUserSchema),
    (req, res, next) => userController.create(req, res, next) // Añadimos 'next'
);

// PUT /api/users/:id
router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "edit"),
    (req, res, next) => userController.update(req, res, next) // Añadimos 'next'
);

// DELETE /api/users/:id
router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "delete"),
    (req, res, next) => userController.delete(req, res, next) // Añadimos 'next'
);

export default router;