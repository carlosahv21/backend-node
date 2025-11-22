// controllers/fieldController.js
const fieldService = require('../services/fieldService');
const utilsCustomError = require('../utils/utilsCustomError');

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
            res.status(200).json(result);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Obtiene un campo por ID.
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const field = await fieldService.getFieldById(id);
            res.status(200).json(field);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }


    /**
     * Crea un nuevo campo (delegando la lógica compleja de cf_X al servicio).
     */
    async create(req, res, next) {
        try {
            const newField = await fieldService.createField(req.body);

            res.status(201).json({
                success: true,
                message: "Campo creado correctamente",
                data: newField
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Actualiza un campo.
     */
    async update(req, res, next) {
        try {
            await fieldService.updateField(req.params.id, req.body);

            res.status(200).json({
                success: true,
                message: "Campo actualizado correctamente"
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Elimina un campo.
     */
    async delete(req, res, next) {
        try {
            await fieldService.deleteField(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Obtiene todos los bloques con sus campos asociados por módulo (incluyendo herencia).
     */
    async getFieldsByModule(req, res, next) {
        const { id: moduleId } = req.params;

        try {
            // Delega la compleja composición de datos al servicio
            const data = await fieldService.getModuleFields(moduleId);

            res.status(200).json({
                success: true,
                module: data
            });
        } catch (error) {
            // Maneja el error 404 de módulo no encontrado o errores 500
            next(new utilsCustomError(error.message, error.status || 500));
        }
    }
}

module.exports = new FieldController();