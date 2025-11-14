// routes/users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionsMiddleware');

router.get("/", authenticateToken, checkPermission("view"), (req, res) => usersController.getAll(req, res));
router.get("/:id", authenticateToken, checkPermission("view"), (req, res) => usersController.getById(req, res));
router.post("/", authenticateToken, checkPermission("create"), (req, res) => usersController.create(req, res));
router.put("/:id", authenticateToken, checkPermission("edit"), (req, res) => usersController.update(req, res));
router.delete("/:id", authenticateToken, checkPermission("delete"), (req, res) => usersController.delete(req, res));

module.exports = router;
