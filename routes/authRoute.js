// routes/authRoute.js
import { Router } from "express";
import authController from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js"; 

const router = Router();

// POST /api/auth/login
router.post("/login", 
    (req, res, next) => authController.login(req, res, next)
);

// GET /api/auth/me
router.get("/me", 
    authMiddleware.authenticateToken, 
    (req, res, next) => authController.me(req, res, next)
);

export default router;