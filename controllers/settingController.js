const knex = require('../db/knex'); // Asegúrate de configurar knex o tu ORM

const getSettings = async () => {
  try {
    const settings = await knex('settings').first(); // Obtiene el primer registro
    return settings; // Devuelve el objeto settings
  } catch (err) {
    throw new Error('Error fetching settings from the database');
  }
};

const updateSettings = async (newSettings) => {
  try {
    await knex('settings').update(newSettings); // Actualiza los valores de la tabla settings
    const updatedSettings = await getSettings(); // Obtiene los valores actualizados
    return updatedSettings; // Devuelve los valores actualizados
  } catch (err) {
    throw new Error('Error updating settings in the database');
  }
};

module.exports = { getSettings, updateSettings };
