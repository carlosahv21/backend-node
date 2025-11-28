// services/studentService.js
import studentModel from '../models/studentModel.js';
import utilsCustomError from '../utils/utilsCustomError.js';

/**
 * Obtiene todos los estudiantes (con paginación, búsqueda, filtros).
 */
const getAllStudents = async (queryParams) => {
    return studentModel.findAll(queryParams);
};

/**
 * Obtiene un estudiante por ID.
 */
const getStudentById = async (id) => {
    return studentModel.findById(id);
};

/**
 * Crea un nuevo estudiante.
 */
const createStudent = async (data) => {
    const newStudent = await studentModel.create(data);

    return newStudent;
};

/**
 * Actualiza un estudiante existente.
 */
const updateStudent = async (id, data) => {
    return studentModel.update(id, data);
};

/**
 * Elimina un estudiante por ID.
 */
const deleteStudent = async (id) => {
    return studentModel.delete(id);
};


export default {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};