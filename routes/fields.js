// routes/fields.js
const express = require('express');
const router = express.Router();
const fieldsController = require('../controllers/fieldsController');

// La ruta debe capturar correctamente `module_id`
router.get('/:id', (req, res) => fieldsController.getFieldsByModule(req, res)); // Obtener campo por ID
router.post('/', (req, res) => fieldsController.create(req, res)); // Crear campo
router.put('/:id', (req, res) => fieldsController.update(req, res)); // Actualizar campo
router.delete('/:id', (req, res) => fieldsController.delete(req, res)); // Eliminar campo


module.exports = router;
