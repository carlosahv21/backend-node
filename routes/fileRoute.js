// routes/fileRoute.js
import { Router } from 'express';
import fileController from '../controllers/fileController.js';
import authMiddleware from '../middlewares/authMiddleware.js';


const router = Router();

// POST /api/files/upload
router.post("/upload",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("files", "edit"),
    (req, res, next) => fileController.uploadLogo(req, res, next)
);

// DELETE /api/files/remove
router.delete("/remove",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("files", "edit"),
    (req, res, next) => fileController.removeFile(req, res, next)
);

export default router;