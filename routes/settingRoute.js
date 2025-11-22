// routes/settings.js
import { Router } from 'express';
import settingController from '../controllers/settingController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/settings
router.get("/", 
    authMiddleware.authenticateToken, 
    authMiddleware.authorize("settings", "view"), 
    (req, res, next) => settingController.getSettings(req, res, next)
);

// PUT /api/settings
router.put("/", 
    authMiddleware.authenticateToken, 
    authMiddleware.authorize("settings", "edit"), 
    (req, res, next) => settingController.updateSettings(req, res, next)
);

export default router;