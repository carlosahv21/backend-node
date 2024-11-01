const fs = require('fs');
const path = require('path');
const multer = require('multer');
const CustomError = require('../utils/CustomError'); // Importa CustomError

// Mapeo de los nombres de los meses
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Función para generar la ruta dinámica basada en año/mes(letras)/semana
const generateStoragePath = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = months[currentDate.getMonth()];
    const week = Math.ceil(currentDate.getDate() / 7);
    const folderPath = path.join('storage', year.toString(), month, `week${week}`);
    return folderPath;
};

// Asegurar que la carpeta existe antes de guardar el archivo
const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = generateStoragePath();
        ensureDirectoryExistence(folderPath);
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileName = `img-${Date.now()}${ext}`;
        cb(null, fileName);
    }
});

// Validación de tipo de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new CustomError('Invalid file type. Only JPEG and PNG are allowed.', 400), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 },
    fileFilter: fileFilter
});

// Función del controlador uploadLogo
const uploadLogo = (req, res, next) => {
    upload.single('logo')(req, res, (err) => {
        if (err) {
            const error = err instanceof multer.MulterError 
                ? new CustomError("Multer error: " + err.message, 400)
                : err;
            return next(error);
        }

        if (!req.file) {
            return next(new CustomError('No file uploaded or invalid file type.', 400));
        }

        const uploadUrl = `${req.file.path}`;
        res.json({ url: uploadUrl });
    });
};

const removeLogo = (req, res, next) => {
    const { imageUrl } = req.body;

    try {
        const filePath = path.join(__dirname, '../', imageUrl);

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return next(new CustomError('File not found', 404));
            }

            fs.unlink(filePath, (err) => {
                if (err) {
                    return next(new CustomError('Failed to delete image', 500));
                }
                res.json({ message: 'Image deleted successfully' });
            });
        });
    } catch (error) {
        next(new CustomError('Error deleting image', 500));
    }
};

module.exports = { uploadLogo, removeLogo };
