// controllers/moduleController.js
import moduleService from '../services/moduleService.js';
import utilsCustomError from '../utils/utilsCustomError.js';

/**
 * Clase controladora para Módulos (Modules).
 */
class ModuleController {

    async getAll(req, res, next) {
        try {
            const result = await moduleService.getAllModules(req.query);
            res.status(200).json(result);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const module = await moduleService.getModuleById(id);
            res.status(200).json(module);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async create(req, res, next) {
        try {
            const newModule = await moduleService.createModule(req.body);
            res.status(201).json(newModule);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async update(req, res, next) {
        try {
            await moduleService.updateModule(req.params.id, req.body);
            res.status(200).json({ message: "Módulo actualizado correctamente" });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async delete(req, res, next) {
        try {
            await moduleService.deleteModule(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Alterna el estado 'is_active' de un módulo.
     */
    async toggle(req, res, next) {
        try {
            const { id } = req.params;
            // La lógica de búsqueda, cálculo de estado y actualización está en el servicio
            const newStatus = await moduleService.toggleModuleStatus(id);

            res.status(200).json({
                success: true,
                message: `Módulo ID ${id} ahora está ${newStatus ? 'activo' : 'inactivo'}`,
                is_active: newStatus
            });
        } catch (error) {
            // Maneja el 404 o 500
            next(new utilsCustomError(error.message, error.status || 500));
        }
    }
}

export default new ModuleController();