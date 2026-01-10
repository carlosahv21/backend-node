// services/teacherService.js
import teacherModel from '../models/teacherModel.js';

/**
 * Obtiene todos los profesores (con paginación, búsqueda, filtros).
 */
const getAllTeachers = async (queryParams) => {
    return teacherModel.findAll(queryParams);
};

/**
 * Crea un nuevo profesor, delegando al modelo.
 */
const createTeacher = async (data) => {
    // Validación de campos requeridos delegada al modelo o manejada por base de datos/controlador
    const newTeacher = await teacherModel.create(data);
    return newTeacher;
};

/**
 * Obtiene un profesor por ID.
 */
const getTeacherById = async (id) => {
    return teacherModel.findById(id);
};

/**
 * Obtiene un profesor por ID con detalles.
 */
const getTeacherByIdDetails = async (id) => {
    return teacherModel.findByIdDetails(id);
};

/**
 * Actualiza un profesor existente, delegando al modelo.
 */
const updateTeacher = async (id, data) => {
    return teacherModel.update(id, data);
};

// Elimina un profesor por ID.
const binTeacher = async (id) => {
    return teacherModel.bin(id);
};

// Restaura un profesor por ID.
const restoreTeacher = async (id) => {
    return teacherModel.restore(id);
};

const deleteTeacher = async (id) => {
    return teacherModel.delete(id);
};


export default {
    getAllTeachers,
    createTeacher,
    getTeacherById,
    getTeacherByIdDetails,
    updateTeacher,
    binTeacher,
    restoreTeacher,
    deleteTeacher,
};