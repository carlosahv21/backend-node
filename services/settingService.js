// services/settingService.js
const settingModel = require('../models/settingModel');
const utilsCustomError = require('../utils/utilsCustomError');

/**
 * Obtiene la configuración global de la aplicación.
 */
const getSettings = async () => {
    try {
        const settings = await settingModel.findFirst();

        if (!settings) {
            throw new utilsCustomError('Settings not found', 404, 'No settings available in the database');
        }
        return settings;
    } catch (err) {
        if (err instanceof utilsCustomError) throw err;

        // Maneja errores de base de datos como 500
        console.error("Error al obtener la configuración:", err.message);
        throw new utilsCustomError('Error fetching settings from the database', 500, err.message);
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
                throw new utilsCustomError('Failed to update settings (Rows affected: 0)', 500, 'Database update failed unexpectedly');
            }
        }
        
        return getSettings();

    } catch (err) {
        if (err instanceof utilsCustomError) throw err;

        console.error("Error al actualizar la configuración:", err.message);
        throw new utilsCustomError('Error updating settings in the database', 500, err.message);
    }
};

module.exports = { getSettings, updateSettings };