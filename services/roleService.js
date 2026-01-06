// services/roleService.js
import roleModel from '../models/roleModel.js';

const getAllRoles = async (queryParams) => {
    return roleModel.findAll(queryParams); 
};

const getRoleById = async (id) => {
    return roleModel.findById(id);
};

const createRole = async (data) => {
    return roleModel.create(data); 
};

const updateRole = async (id, data) => {
    return roleModel.update(id, data);
};

const deleteRole = async (id) => {
    // Nota: Si el rol tiene usuarios o permisos asociados, la lógica de negocio 
    // para manejar la cascada o lanzar un error debería ir aquí.
    return roleModel.delete(id);
};

export default {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
};