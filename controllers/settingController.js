const knex = require('../db/knex');
const utilsCustomError = require('../utils/utilsCustomError');

const getSettings = async () => {
  try {
    const settings = await knex('settings').first();
    if (!settings) {
      throw new utilsCustomError('Settings not found', 404, 'No settings available in the database');
    }
    return settings;
  } catch (err) {
    throw new utilsCustomError('Error fetching settings from the database', 500, err.message);
  }
};

const updateSettings = async (newSettings) => {
  try {
    const updated = await knex('settings').update(newSettings);
    
    // Verificar si la actualización fue exitosa
    if (!updated) {
      throw new utilsCustomError('Failed to update settings', 500, 'Database update failed');
    }
    
    const updatedSettings = await getSettings();
    return updatedSettings;
  } catch (err) {
    throw new utilsCustomError('Error updating settings in the database', 500, err.message);
  }
};

module.exports = { getSettings, updateSettings };
