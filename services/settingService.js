// services/settingService.js
import settingModel from '../models/settingModel.js';
import AppError from '../utils/AppError.js';

/**
 * Obtiene la configuración global de la aplicación.
 */
const getSettings = async () => {
    try {
        const settings = await settingModel.findFirst();

        if (!settings) {
            throw new AppError('Configuración no encontrada.', 404);
        }
        return settings;
    } catch (err) {
        throw new AppError('Error al obtener la configuración', 500);
    }
};

/**
 * Actualiza la configuración global de la aplicación.
 */
const updateSettings = async (newSettings) => {
    try {
        const updatedRows = await settingModel.updateFirst(newSettings);

        if (updatedRows === 0) {
            const existingSettings = await settingModel.findFirst();
            if (!existingSettings) {
                await settingModel.create(newSettings);
            } else {
                throw new AppError('No se actualizaron filas', 500);
            }
        }
        
        return getSettings();

    } catch (err) {
        throw new AppError('Error al actualizar la configuración', 500);
    }
};

export default { getSettings, updateSettings };