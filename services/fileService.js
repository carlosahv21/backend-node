// services/fileService.js
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import utilsCustomError from '../utils/utilsCustomError.js';

// Promisify fs functions for easier async/await usage
const access = promisify(fs.access);
const unlink = promisify(fs.unlink);

/**
 * Elimina un archivo del sistema de almacenamiento.
 */
const deleteFileByPath = async (imageUrl) => {
    const filePath = path.join(process.cwd(), imageUrl);

    try {
        await access(filePath, fs.constants.F_OK);

        await unlink(filePath);
        
        return { success: true, message: 'Archivo eliminado exitosamente' };

    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new utilsCustomError('Archivo no encontrado', 404, `No se pudo encontrar el archivo en la ruta: ${filePath}`);
        }
        
        console.error('Error del sistema de archivos al eliminar:', err.message);
        throw new utilsCustomError('Error al intentar eliminar el archivo', 500, err.message);
    }
};

export default {
    deleteFileByPath
};