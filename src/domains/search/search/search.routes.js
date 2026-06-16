import { Router } from "express";
import searchController from "./search.controller.js";
import authMiddleware from "../../../shared/middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware.authenticateToken, searchController.searchAll);

export default router;