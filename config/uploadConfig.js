// config/uploadConfig.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const utilsCustomError = require('../utils/utilsCustomError');

// Mapeo de los nombres de los meses
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Genera la ruta dinámica de almacenamiento basada en año/mes(letras)/semana.
 */
const generateStoragePath = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = months[currentDate.getMonth()];
    // Calcula la semana del mes (simplificado)
    const week = Math.ceil(currentDate.getDate() / 7); 
    // La ruta se define para que Multer la utilice: storage/2025/January/week1
    const folderPath = path.join('storage', year.toString(), month, `week${week}`);
    return folderPath;
};

/**
 * Asegura que la carpeta de destino exista, creándola recursivamente si es necesario.
 * @param {string} dir Ruta absoluta o relativa de la carpeta.
 */
const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)) {
        // { recursive: true } asegura la creación de todos los directorios intermedios
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Configuración de almacenamiento en disco de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = generateStoragePath();
        ensureDirectoryExistence(folderPath); // Creamos la carpeta
        cb(null, folderPath); // Multer usa esta ruta
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileName = `${path.basename(file.originalname, ext)}-${Date.now()}${ext}`;
        cb(null, fileName);
    }
});

// Validación de tipo de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new utilsCustomError('Tipo de archivo inválido. Solo se permiten JPEG y PNG.', 400), false);
    }
    cb(null, true);
};

// Instancia de Multer configurada
const uploadMiddleware = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter
});

module.exports = {
    uploadMiddleware
};