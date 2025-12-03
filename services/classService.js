// services/classService.js
import classModel from '../models/classModel.js';
import utilsCustomError from '../utils/utilsCustomError.js';

/**
 * Obtiene todas las clases (con paginación, búsqueda, filtros).
 */
const getAllClasses = async (queryParams) => {
    return classModel.findAll(queryParams);
};

/**
 * Crea una nueva clase. 
 */
const createClass = async (data) => {
    if (!data.name || !data.date) {
        throw new utilsCustomError('Faltan campos obligatorios para crear la clase (name, date)', 400);
    }

    const newClass = await classModel.create(data);

    return newClass;
};

/**
 * Obtiene una clase por ID.
 */
const getClassById = async (id) => {
    return classModel.findById(id);
};

/**
 * Obtiene una clase por ID con detalles.
 */
const getClassByIdDetails = async (id) => {
    return classModel.findByIdDetails(id);
};

/**
 * Actualiza una clase existente.
 */
const updateClass = async (id, data) => {
    const updatedClass = await classModel.update(id, data);

    return updatedClass;
};

/**
 * Elimina una clase por ID.
 */
const deleteClass = async (id) => {
    return classModel.delete(id);
};


export default {
    getAllClasses,
    createClass,
    getClassById,
    getClassByIdDetails,
    updateClass,
    deleteClass,
};