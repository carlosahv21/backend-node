// routes/classes.js
const express = require('express');
const router = express.Router();
const { getAllClasses, createClass, updateClass, deleteClass } = require('../controllers/classesController');

router.get('/', getAllClasses); // Paginación, búsqueda y filtros
router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

module.exports = router;
