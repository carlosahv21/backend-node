
// routes/routes.js
import { Router } from 'express';
import routeController from '../controllers/routeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/routes
router.get("/", 
    authMiddleware.authenticateToken, 
    (req, res, next) => routeController.getRoutes(req, res, next)
);

export default router;