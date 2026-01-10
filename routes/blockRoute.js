// routes/blockRoute.js
import { Router } from 'express';
import blockController from '../controllers/blockController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/blocks
router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "view"),
    (req, res, next) => blockController.getAll(req, res, next)
);

// GET /api/blocks/:id
router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "view"),
    (req, res, next) => blockController.getById(req, res, next)
);

// POST /api/blocks
router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "create"),
    (req, res, next) => blockController.create(req, res, next)
);

// PUT /api/blocks/:id
router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "edit"),
    (req, res, next) => blockController.update(req, res, next)
);

// PATCH /api/blocks/:id/bin
router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "delete"),
    (req, res, next) => blockController.bin(req, res, next)
);

// PATCH /api/blocks/:id/restore
router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "delete"),
    (req, res, next) => blockController.restore(req, res, next)
);

// DELETE /api/blocks/:id
router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "delete"),
    (req, res, next) => blockController.delete(req, res, next)
);

export default router;