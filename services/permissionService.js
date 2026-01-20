// services/permissionService.js
import permissionModel from '../models/permissionModel.js';

class permissionService {
    /**
     * Obtiene todos los permisos (con paginación, búsqueda, filtros).
     */
    async getAllPermissions(queryParams) {
        return permissionModel.findAll(queryParams);
    }

    /**
     * Obtiene un permiso por ID.
     */
    async getPermissionById(id) {
        return permissionModel.findById(id);
    }

    /**
     * Crea un nuevo permiso.
     */
    async createPermission(data) {
        return permissionModel.create(data);
    }

    /**
     * Actualiza un permiso por ID.
     */
    async updatePermission(id, data) {
        return permissionModel.update(id, data);
    }

    /**
     * Envía un permiso a la papelera por ID.
     */
    async binPermission(id, userId) {
        return permissionModel.bin(id, userId);
    }

    /**
     * Restaura un permiso enviado a la papelera por ID.
     */
    async restorePermission(id) {
        return permissionModel.restore(id);
    }

    /**
     * Elimina permanentemente un permiso por ID.
     */
    async deletePermission(id) {
        return permissionModel.delete(id);
    }
}

export default new permissionService();
