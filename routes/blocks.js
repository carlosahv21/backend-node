// routes/classes.js
const express = require('express');
const router = express.Router();
const blocksController = require('../controllers/blocksController.js');

// Rutas que utilizan los métodos genéricos de BaseController
router.get('/', (req, res) => blocksController.getAll(req, res)); // Obtener todas las clases
router.get('/:id', (req, res) => blocksController.getById(req, res)); // Obtener clase por ID
router.post('/', (req, res) => blocksController.create(req, res)); // Crear clase
router.put('/:id', (req, res) => blocksController.update(req, res)); // Actualizar clase
router.delete('/:id', (req, res) => blocksController.delete(req, res)); // Eliminar clase

module.exports = router;
