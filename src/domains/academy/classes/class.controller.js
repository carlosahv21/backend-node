import classService from './class.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class ClassController {
    async getAll(req, res, next) {
        try {
            const result = await classService.getAllClasses(req.query);
            ApiResponse.success(res, 200, "Clases obtenidas correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const classData = await classService.getClassById(id);
            ApiResponse.success(res, 200, "Clase obtenida correctamente", classData);
        } catch (error) {
            next(error);
        }
    }

    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const classDetails = await classService.getClassByIdDetails(id);
            ApiResponse.success(res, 200, "Detalles de la clase obtenidos correctamente", classDetails);
        } catch (error) {
            next(error);
        }
    }

    async getNextClass(req, res, next) {
        try {
            const nextClass = await classService.getNextClass();
            ApiResponse.success(res, 200, "Próxima clase obtenida correctamente", nextClass);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newClass = await classService.createClass(req.body);
            ApiResponse.success(res, 201, "Clase creada correctamente", newClass);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updatedClass = await classService.updateClass(req.params.id, req.body);
            ApiResponse.success(res, 200, "Clase actualizada correctamente", updatedClass);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await classService.deleteClass(req.params.id);
            ApiResponse.success(res, 204, "Clase eliminada correctamente");
        } catch (error) {
            next(error);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await classService.binClass(req.params.id);
            ApiResponse.success(res, 200, "Clase movida a papelera correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await classService.restoreClass(req.params.id);
            ApiResponse.success(res, 200, "Clase restaurada correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async enrollStudents(req, res, next) {
        try {
            const { id } = req.params;
            const { student_ids } = req.body;
            const result = await classService.enrollStudents(id, student_ids);
            ApiResponse.success(res, 200, "Estudiantes inscritos correctamente", result);
        } catch (error) {
            next(error);
        }
    }
}

export default new ClassController();