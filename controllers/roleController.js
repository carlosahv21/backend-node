// controllers/roleController.js
import e from 'cors';
import roleService from '../services/roleService.js';
import utilsCustomError from '../utils/utilsCustomError.js';

/**
 * Clase controladora para Roles.
 */
class RoleController {
    async getAll(req, res, next) {
        try {
            const result = await roleService.getAllRoles(req.query);
            res.status(200).json(result); 
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const role = await roleService.getRoleById(id);
            res.status(200).json(role);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async create(req, res, next) {
        try {
            const newRole = await roleService.createRole(req.body);
            res.status(201).json({ 
                success: true,
                message: "Rol creado correctamente", 
                data: newRole 
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }
    
    async update(req, res, next) {
        try {
            await roleService.updateRole(req.params.id, req.body);
            res.status(200).json({ 
                success: true,
                message: "Rol actualizado correctamente" 
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async delete(req, res, next) {
        try {
            await roleService.deleteRole(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }
}

export default new RoleController();