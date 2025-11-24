// routes/moduleRoute.js
import { Router } from 'express';
import moduleController from '../controllers/moduleController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/modules
router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "view"),
    (req, res, next) => moduleController.getAll(req, res, next)
);

// GET /api/modules/:id
router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "view"),
    (req, res, next) => moduleController.getById(req, res, next)
);

// POST /api/modules
router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "create"),
    (req, res, next) => moduleController.create(req, res, next)
);

// PUT /api/modules/:id
router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "edit"),
    (req, res, next) => moduleController.update(req, res, next)
);

// DELETE /api/modules/:id
router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "delete"),
    (req, res, next) => moduleController.delete(req, res, next)
);

// PUT /api/modules/toggle/:id
router.put("/toggle/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "edit"),
    (req, res, next) => moduleController.toggle(req, res, next)
);

export default router;