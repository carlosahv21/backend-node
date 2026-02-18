// services/roleService.js
import roleModel from '../models/roleModel.js';

class RoleService {
    /**
     * Obtiene todos los roles.
     */
    async getAllRoles(queryParams) {
        return roleModel.findAll(queryParams);
    };

    /**
     * Obtiene un rol por ID.
     */
    async getRoleById(id) {
        return roleModel.findById(id);
    };

    /**
     * Obtiene un rol por ID con detalles.
     */
    async getRoleByIdDetails(id) {
        return roleModel.findByIdDetails(id);
    };

    /**
     * Crea un nuevo rol.
     */
    async createRole(data) {
        return roleModel.create(data);
    };

    /**
     * Actualiza un rol existente.
     */
    async updateRole(id, data) {
        return roleModel.update(id, data);
    };

    /**
     * Elimina un rol.
     */
    async deleteRole(id) {
        // Nota: Si el rol tiene usuarios o permisos asociados, la lógica de negocio 
        // para manejar la cascada o lanzar un error debería ir aquí.
        return roleModel.delete(id);
    };

    /**
     * Elimina un rol.
     */
    async binRole(id, userId) {
        return roleModel.bin(id, userId);
    };

    /**
     * Restaura un rol eliminado.
     */
    async restoreRole(id) {
        return roleModel.restore(id);
    };
}

export default new RoleService();