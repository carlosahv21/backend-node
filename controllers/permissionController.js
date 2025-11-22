// controllers/permissionController.js
const permissionService = require('../services/permissionService');
const utilsCustomError = require('../utils/utilsCustomError');

/**
 * Clase controladora para Permisos (Permissions). 
 */
class PermissionController {
    async getAll(req, res, next) {
        try {
            const result = await permissionService.getAllPermissions(req.query);
            res.status(200).json(result); 
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const permission = await permissionService.getPermissionById(id);
            res.status(200).json(permission);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async create(req, res, next) {
        try {
            const newPermission = await permissionService.createPermission(req.body);
            res.status(201).json({ 
                success: true,
                message: "Permiso creado correctamente", 
                data: newPermission 
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }
    
    async update(req, res, next) {
        try {
            await permissionService.updatePermission(req.params.id, req.body);
            res.status(200).json({ 
                success: true,
                message: "Permiso actualizado correctamente" 
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async delete(req, res, next) {
        try {
            await permissionService.deletePermission(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }
}

module.exports = new PermissionController();