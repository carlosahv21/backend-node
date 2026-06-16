import { Router } from 'express';
import routeController from './route.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("routes", "view"),
    (req, res, next) => routeController.getRoutes(req, res, next)
);

export default router;