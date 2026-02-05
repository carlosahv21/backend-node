// controllers/classController.js
import classService from '../services/classService.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Clase controladora para Clases.
 */
class ClassController {

    /**
     * Obtiene todas las clases.
     */
    async getAll(req, res, next) {
        try {
            const result = await classService.getAllClasses(req.query);
            ApiResponse.success(res, 200, "Clases obtenidas correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Obtiene una clase por ID.
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const classRecord = await classService.getClassById(id);
            ApiResponse.success(res, 200, "Clase obtenida correctamente", classRecord);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Obtiene una clase por ID con detalles.
     */
    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const classRecord = await classService.getClassByIdDetails(id);
            ApiResponse.success(res, 200, "Clase obtenida correctamente", classRecord);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Crea una nueva clase.
     */
    async create(req, res, next) {
        try {
            const newClass = await classService.createClass(req.body);
            ApiResponse.success(res, 201, "Clase creada correctamente", newClass);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Actualiza una clase.
     */
    async update(req, res, next) {
        try {
            await classService.updateClass(req.params.id, req.body);
            ApiResponse.success(res, 200, "Clase actualizada correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Elimina una clase.
     */
    async delete(req, res, next) {
        try {
            await classService.deleteClass(req.params.id);
            ApiResponse.success(res, 204, "Clase eliminada correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await classService.binClass(req.params.id);
            ApiResponse.success(res, 200, "Clase movida a papelera correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await classService.restoreClass(req.params.id);
            ApiResponse.success(res, 200, "Clase restaurada correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getNextClass(req, res, next) {
        try {
            const nextClass = await classService.getNextClass();
            ApiResponse.success(res, 200, "Clase obtenida correctamente", nextClass);
        } catch (error) {
            console.log(error);
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new ClassController();