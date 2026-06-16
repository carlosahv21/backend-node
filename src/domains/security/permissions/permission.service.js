import permissionRepository from './permission.repository.js';

class PermissionService {
    async getAllPermissions(queryParams) {
        return permissionRepository.findAll(queryParams);
    }

    async getPermissionById(id) {
        return permissionRepository.findById(id);
    }

    async createPermission(data) {
        return permissionRepository.create(data);
    }

    async updatePermission(id, data) {
        return permissionRepository.update(id, data);
    }

    async binPermission(id, userId) {
        return permissionRepository.bin(id, userId);
    }

    async restorePermission(id) {
        return permissionRepository.restore(id);
    }

    async deletePermission(id) {
        return permissionRepository.delete(id);
    }
}

export default new PermissionService();