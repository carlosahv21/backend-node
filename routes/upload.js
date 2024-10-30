const express = require('express');
const router = express.Router();
const { uploadLogo, removeLogo } = require('../controllers/uploadController');
// Ruta para la subida de logo
router.post('/upload', uploadLogo);  // Solo usa '/'

router.delete('/delete', removeLogo);  // Solo usa '/:filename'

module.exports = router;
