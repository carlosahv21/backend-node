// services/classService.js
const classModel = require('../models/classModel');
const utilsCustomError = require('../utils/utilsCustomError');

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
    if (!data.name || !data.date || !data.start_time || !data.teacher_id) {
        throw new utilsCustomError('Faltan campos obligatorios para crear la clase (name, date, start_time, teacher_id)', 400);
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


module.exports = {
    getAllClasses,
    createClass,
    getClassById,
    updateClass,
    deleteClass,
};