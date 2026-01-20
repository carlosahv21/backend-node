// services/teacherService.js
import teacherModel from '../models/teacherModel.js';

class TeacherService {
    /**
     * Obtiene todos los profesores (con paginación, búsqueda, filtros).
     */
    async getAllTeachers(queryParams) {
        return teacherModel.findAll(queryParams);
    }

    /**
     * Crea un nuevo profesor, delegando al modelo.
     */
    async createTeacher(data) {
        // Validación de campos requeridos delegada al modelo o manejada por base de datos/controlador
        const newTeacher = await teacherModel.create(data);
        return newTeacher;
    }

    /**
     * Obtiene un profesor por ID.
     */
    async getTeacherById(id) {
        return teacherModel.findById(id);
    }

    /**
     * Obtiene un profesor por ID con detalles.
     */
    async getTeacherByIdDetails(id) {
        return teacherModel.findByIdDetails(id);
    }

    /**
     * Actualiza un profesor existente, delegando al modelo.
     */
    async updateTeacher(id, data) {
        return teacherModel.update(id, data);
    }

    /**
     * Elimina un profesor por ID.
     */
    async binTeacher(id, userId) {
        return teacherModel.bin(id, userId);
    }

    /**
     * Restaura un profesor por ID.
     */
    async restoreTeacher(id) {
        return teacherModel.restore(id);
    }

    /**
     * Elimina un profesor por ID.
     */
    async deleteTeacher(id) {
        return teacherModel.delete(id);
    }

}
export default new TeacherService();