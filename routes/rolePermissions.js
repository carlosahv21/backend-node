// routes/rolePermissions.js
const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermissionController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');

// GET /api/role-permissions/all
router.get("/all", 
    authenticateToken, 
    authorize("roles", "view"), 
    (req, res, next) => rolePermissionController.getAllRolesWithPermissions(req, res, next)
);

// GET /api/role-permissions/:role_id
router.get("/:role_id", 
    authenticateToken, 
    authorize("roles", "view"), 
    (req, res, next) => rolePermissionController.getPermissionsByRole(req, res, next)
);

// PUT /api/role-permissions/:role_id
router.put("/:role_id", 
    authenticateToken, 
    authorize("roles", "edit"), 
    (req, res, next) => rolePermissionController.setPermissionsForRole(req, res, next)
);

module.exports = router;