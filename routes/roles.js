// routes/roles.js
const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');

// Rutas que utilizan los métodos genéricos de BaseController
router.get('/', (req, res) => rolesController.getAll(req, res)); // Obtener todas las clases
router.get('/:id', (req, res) => rolesController.getById(req, res)); // Obtener clase por ID
router.post('/', (req, res) => rolesController.create(req, res)); // Crear clase
router.put('/:id', (req, res) => rolesController.update(req, res)); // Actualizar clase
router.delete('/:id', (req, res) => rolesController.delete(req, res)); // Eliminar clase

module.exports = router;
