const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Mapeo de los nombres de los meses
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Función para generar la ruta dinámica basada en año/mes(letras)/semana
const generateStoragePath = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = months[currentDate.getMonth()];  // Obtener el mes en texto
    const week = Math.ceil(currentDate.getDate() / 7);  // Semana del mes

    // Crear la ruta con año/mes en texto/semana
    const folderPath = path.join('storage', year.toString(), month, `week${week}`);
    return folderPath;
};

// Asegurarse de que la carpeta existe antes de guardar el archivo
const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });  // Crear la carpeta si no existe
    }
};

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = generateStoragePath();
        ensureDirectoryExistence(folderPath);  // Crear la carpeta si no existe
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);  // Obtener la extensión del archivo
        const fileName = `img-${Date.now()}${ext}`;  // Nombre único para el archivo
        cb(null, fileName);
    }
});

// Validación de tipo de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 },  // Limitar tamaño del archivo a 1MB
    fileFilter: fileFilter
});

// Función del controlador uploadLogo
const uploadLogo = (req, res) => {
    upload.single('logo')(req, res, (err) => {        
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
        }

        const uploadUrl = `${req.file.path}`;

        // Retornar la URL del archivo subido
        res.json({ url: uploadUrl });
    });
};

const removeLogo = (req, res) => {
    const { imageUrl } = req.body;

    try {
        // Construir la ruta completa a partir de la URL de la imagen proporcionada
        const filePath = path.join(__dirname, '../', imageUrl);

        // Verificar si el archivo existe
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('File does not exist:', filePath);
                return res.status(404).json({ message: 'File not found' });
            }

            // Si el archivo existe, eliminarlo
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting image:', err);
                    return res.status(500).json({ message: 'Failed to delete image' });
                }
                return res.json({ message: 'Image deleted successfully' });
            });
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Error deleting image' });
    }
};

module.exports = { uploadLogo, removeLogo };


