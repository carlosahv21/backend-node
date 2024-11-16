// routes/classes.js
const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classesController');

// Rutas que utilizan los métodos genéricos de BaseController
router.get('/', (req, res) => classesController.getAll(req, res)); // Obtener todas las clases
router.get('/:id', (req, res) => classesController.getById(req, res)); // Obtener clase por ID
router.post('/', (req, res) => classesController.create(req, res)); // Crear clase
router.put('/:id', (req, res) => classesController.update(req, res)); // Actualizar clase
router.delete('/:id', (req, res) => classesController.delete(req, res)); // Eliminar clase

module.exports = router;
