import roleRepository from './role.repository.js';

class RoleService {
    async getAllRoles(queryParams) {
        return roleRepository.findAll(queryParams);
    }

    async getRoleById(id) {
        return roleRepository.findById(id);
    }

    async getRoleByIdDetails(id) {
        return roleRepository.findByIdDetails(id);
    }

    async createRole(data) {
        return roleRepository.create(data);
    }

    async updateRole(id, data) {
        return roleRepository.update(id, data);
    }

    async deleteRole(id) {
        return roleRepository.delete(id);
    }

    async binRole(id, userId) {
        return roleRepository.bin(id, userId);
    }

    async restoreRole(id) {
        return roleRepository.restore(id);
    }
}

export default new RoleService();