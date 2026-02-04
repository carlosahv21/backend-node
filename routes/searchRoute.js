// routes/SearchRoutes.js
import { Router } from "express";
import searchController from "../controllers/searchController.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/search
router.get("/",
    authMiddleware.authenticateToken,
    (req, res, next) => searchController.searchAll(req, res, next)
);

export default router;
