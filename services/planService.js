// services/student.service.js
import planModel from '../models/planModel.js';
import AppError from '../utils/AppError.js';

/**
 * Obtiene todos los estudiantes (con paginación, búsqueda, filtros).
 */
const getAllPlans = async (queryParams) => {
    return planModel.findAll(queryParams);
};

/**
 * Obtiene un estudiante por ID.
 */
const getPlanById = async (id) => {
    return planModel.findById(id);
};

/**
 * Obtiene un estudiante por ID con detalles.
 */
const getPlanByIdDetails = async (id) => {
    return planModel.findByIdDetails(id);
};

/**
 * Crea un nuevo estudiante.
 */
const createPlan = async (data) => {
    const { name } = data;

    if (!name) {
        throw new AppError('El campo "name" es requerido.', 400);
    }

    const newPlan = await planModel.create(data);

    return newPlan;
};

/**
 * Actualiza un estudiante existente.
 */
const updatePlan = async (id, data) => {
    return planModel.update(id, data);
};

/**
 * Elimina un estudiante por ID.
 */
const deletePlan = async (id) => {
    return planModel.delete(id);
};

/**
 * Obtiene el plan actual de un estudiante.
 */
const getStudentPlan = async (student_id) => {
    return planModel.getStudentPlan(student_id);
};

export default {
    getAllPlans,
    getPlanById,
    getPlanByIdDetails,
    createPlan,
    updatePlan,
    deletePlan,
    getStudentPlan
};