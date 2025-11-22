// routes/rolePermissionRoute.js
import { Router } from 'express';
import rolePermissionController from '../controllers/rolePermissionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/role_permissions/all
router.get("/all",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("roles", "view"),
    (req, res, next) => rolePermissionController.getAllRolesWithPermissions(req, res, next)
);

// GET /api/role_permissions/:role_id
router.get("/:role_id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("roles", "view"),
    (req, res, next) => rolePermissionController.getPermissionsByRole(req, res, next)
);

// PUT /api/role_permissions/:role_id
router.put("/:role_id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("roles", "edit"),
    (req, res, next) => rolePermissionController.setPermissionsForRole(req, res, next)
);

export default router;