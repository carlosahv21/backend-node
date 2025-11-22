// routes/role-permissions.js
const express = require('express');
const router = express.Router();
const rolePermissionsRoute = require('../controllers/rolePermissionsController.js');

router.get('/', (req, res) => rolePermissionsRoute.getAllRolesWithPermissions(req, res));
router.get('/:role_id', (req, res) => rolePermissionsRoute.getPermissionsByRole(req, res));
router.post('/:role_id', (req, res) => rolePermissionsRoute.setPermissionsForRole(req, res));

module.exports = router;