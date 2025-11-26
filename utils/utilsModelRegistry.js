import UserModel from '../models/userModel.js';

/**
 * Registro centralizado de modelos.
 */
const modelRegistry = {
    'users': UserModel,
};

/**
 * Función que permite obtener la instancia de un modelo dado el nombre de la tabla.
 */
export function getModelInstance(tableName) {
    const key = tableName.toLowerCase(); 
    return modelRegistry[key] || null;
}