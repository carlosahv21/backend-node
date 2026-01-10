import fieldService from '../services/fieldService.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Clase controladora para Campos (Fields).
 */
class FieldController {

    /**
     * Obtiene todos los campos.
     */
    async getAll(req, res, next) {
        try {
            const result = await fieldService.getAllFields(req.query);
            ApiResponse.success(res, 200, "Campos obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Obtiene un campo por ID.
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const field = await fieldService.getFieldById(id);
            ApiResponse.success(res, 200, "Campo obtenido correctamente", field);
        } catch (error) {
            ApiResponse.error(res, 500, error.message);
        }
    }

    /**
     * Crea un nuevo campo (delegando la lógica compleja de cf_X al servicio).
     */
    async create(req, res, next) {
        try {
            const newField = await fieldService.createField(req.body);
            ApiResponse.success(res, 201, "Campo creado correctamente", newField);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Actualiza un campo.
     */
    async update(req, res, next) {
        try {
            await fieldService.updateField(req.params.id, req.body);

            ApiResponse.success(res, 200, "Campo actualizado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Elimina un campo.
     */
    async delete(req, res, next) {
        try {
            await fieldService.deleteField(req.params.id);
            ApiResponse.success(res, 204, "Campo eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await fieldService.binField(req.params.id);
            ApiResponse.success(res, 200, "Campo movido a papelera correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await fieldService.restoreField(req.params.id);
            ApiResponse.success(res, 200, "Campo restaurado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Obtiene todos los bloques con sus campos asociados por módulo (incluyendo herencia).
     */
    async getFieldsByModule(req, res, next) {
        const { id: moduleId } = req.params;

        try {
            const data = await fieldService.getModuleFields(moduleId);
            ApiResponse.success(res, 200, "Bloques obtenidos correctamente", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Obtiene las opciones dinámicas de una relación (campo tipo relación).
     */
    async getRelationField(req, res, next) {
        try {            
            const { relation_config, search } = req.body;

            if (!relation_config) {
                ApiResponse.error(res, 400, "El parámetro 'relation_config' es obligatorio para obtener opciones de relación.");
            }

            const options = await fieldService.getRelationField(relation_config, search || "");

            ApiResponse.success(res, 200, "Opciones obtenidas correctamente", options);

        } catch (error) {
            if (error instanceof SyntaxError && error.message.includes('JSON')) {
                ApiResponse.error(res, 400, "El parámetro 'relation_config' no tiene un formato JSON válido.");
            } else {
                const status = error.statusCode || 500;
                ApiResponse.error(res, status, error.message);
            }
        }
    }
}

export default new FieldController();