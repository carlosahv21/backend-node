// controllers/teacherController.js
import teacherService from '../services/teacherService.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Clase controladora para Teacher.
 * Maneja la entrada/salida de la petición HTTP y delega la lógica al Servicio.
 * Usa 'next(error)' para pasar errores al middleware centralizado.
 */
class TeacherController {

    async getAll(req, res, next) {
        try {
            const result = await teacherService.getAllTeachers(req.query);
            ApiResponse.success(res, 200, "Profesores obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const teacher = await teacherService.getTeacherById(id);

            if (!teacher) {
                return ApiResponse.error(res, 404, "Profesor no encontrado.");
            }

            ApiResponse.success(res, 200, "Profesor obtenido correctamente", teacher);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const teacher = await teacherService.getTeacherByIdDetails(id);

            if (!teacher) {
                return ApiResponse.error(res, 404, "Profesor no encontrado.");
            }

            ApiResponse.success(res, 200, "Profesor obtenido correctamente", teacher);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const newTeacher = await teacherService.createTeacher(req.body);
            ApiResponse.success(res, 201, "Teacher creado correctamente", newTeacher);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const teacher = await teacherService.updateTeacher(id, req.body);

            if (!teacher) {
                return ApiResponse.error(res, 404, "Profesor no encontrado para actualizar.");
            }

            ApiResponse.success(res, 200, "Teacher actualizado correctamente", teacher);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deletedTeacher = await teacherService.deleteTeacher(id);

            if (!deletedTeacher) {
                return ApiResponse.error(res, 404, "Profesor no encontrado para eliminar.");
            }

            ApiResponse.success(res, 204, "Teacher eliminado correctamente", deletedTeacher);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bin(req, res, next) {
        try {
            const { id } = req.params;
            const result = await teacherService.binTeacher(id);
            ApiResponse.success(res, 200, "Teacher movido a papelera exitosamente.", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restore(req, res, next) {
        try {
            const { id } = req.params;
            const result = await teacherService.restoreTeacher(id);
            ApiResponse.success(res, 200, "Teacher restaurado exitosamente.", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new TeacherController();