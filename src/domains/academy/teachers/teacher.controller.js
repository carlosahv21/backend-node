import teacherService from './teacher.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

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
            ApiResponse.success(res, 200, "Detalles del profesor obtenidos correctamente", teacher);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const newTeacher = await teacherService.createTeacher(req.body);
            ApiResponse.success(res, 201, "Profesor creado correctamente", newTeacher);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res, next) {
        try {
            const updatedTeacher = await teacherService.updateTeacher(req.params.id, req.body);
            ApiResponse.success(res, 200, "Profesor actualizado correctamente", updatedTeacher);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            await teacherService.deleteTeacher(req.params.id);
            ApiResponse.success(res, 204, "Profesor eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await teacherService.binTeacher(req.params.id);
            ApiResponse.success(res, 200, "Profesor movido a papelera correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await teacherService.restoreTeacher(req.params.id);
            ApiResponse.success(res, 200, "Profesor restaurado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new TeacherController();