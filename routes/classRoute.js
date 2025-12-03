// routes/classRoute.js
import { Router } from 'express';
import classController from '../controllers/classController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/classes
router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "view"),
    (req, res, next) => classController.getAll(req, res, next)
);

// GET /api/classes/:id
router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "view"),
    (req, res, next) => classController.getById(req, res, next)
);

// GET /api/classes/details/:id
router.get("/details/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "view"),
    (req, res, next) => classController.getByIdDetails(req, res, next)
);

// POST /api/classes
router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "create"),
    (req, res, next) => classController.create(req, res, next)
);

// PUT /api/classes/:id
router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "edit"),
    (req, res, next) => classController.update(req, res, next)
);

// DELETE /api/classes/:id
router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "delete"),
    (req, res, next) => classController.delete(req, res, next)
);

export default router;