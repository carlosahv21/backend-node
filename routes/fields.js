// routes/fields.js
const express = require('express');
const router = express.Router();
const { getFieldsByModule } = require('../controllers/fieldsController');

// La ruta debe capturar correctamente `module_id`
router.get('/:module_id/fields', getFieldsByModule);

module.exports = router;
