const knex = require('../db/knex');
const CustomError = require('../utils/CustomError');

const getSettings = async () => {
  try {
    const settings = await knex('settings').first();
    if (!settings) {
      throw new CustomError('Settings not found', 404, 'No settings available in the database');
    }
    return settings;
  } catch (err) {
    throw new CustomError('Error fetching settings from the database', 500, err.message);
  }
};

const updateSettings = async (newSettings) => {
  try {
    const updated = await knex('settings').update(newSettings);
    
    // Verificar si la actualización fue exitosa
    if (!updated) {
      throw new CustomError('Failed to update settings', 500, 'Database update failed');
    }
    
    const updatedSettings = await getSettings();
    return updatedSettings;
  } catch (err) {
    throw new CustomError('Error updating settings in the database', 500, err.message);
  }
};

module.exports = { getSettings, updateSettings };
