const express = require('express');
const router = express.Router();
const { uploadLogo, removeLogo } = require('../controllers/uploadController');
// Ruta para la subida de logo
router.post('/', uploadLogo);  // Solo usa '/'

router.delete('/', removeLogo);  // Solo usa '/:filename'

module.exports = router;
