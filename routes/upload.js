const express = require('express');
const router = express.Router();
const { uploadLogo, removeLogo } = require('../controllers/uploadController');

// Ruta para la subida de logo
router.post('/', uploadLogo);
router.delete('/', removeLogo);

module.exports = router;
