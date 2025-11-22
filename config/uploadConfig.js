// config/uploadConfig.js
import fs from 'fs';
import path from 'path';
import multer from 'multer';

import utilsCustomError from '../utils/utilsCustomError.js';

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
    const week = Math.ceil(currentDate.getDate() / 7);
    const folderPath = path.join('storage', year.toString(), month, `week${week}`);
    return folderPath;
};

/**
 * Asegura que la carpeta de destino exista, creándola recursivamente si es necesario.
 */
const ensureDirectoryExistence = (dir) => {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    } catch (error) {
        console.error("Error creating directory:", error);
        throw new Error(`Failed to ensure directory existence for: ${dir}`);
    }
};

// Configuración de almacenamiento en disco de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = generateStoragePath();
        try {
            ensureDirectoryExistence(folderPath);
            cb(null, folderPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_'); // Reemplaza espacios con guiones bajos
        const fileName = `${baseName}-${Date.now()}${ext}`;
        cb(null, fileName);
    }
});

// Validación de tipo de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new utilsCustomError('Tipo de archivo inválido. Solo se permiten JPEG y PNG.', 400);
        return cb(error, false);
    }
    cb(null, true);
};

const uploadMiddleware = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB
    fileFilter: fileFilter
});

export {
    uploadMiddleware
};