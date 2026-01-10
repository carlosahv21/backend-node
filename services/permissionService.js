// services/permissionService.js
import permissionModel from '../models/permissionModel.js';

const getAllPermissions = async (queryParams) => {
    return permissionModel.findAll(queryParams);
};

const getPermissionById = async (id) => {
    return permissionModel.findById(id);
};

const createPermission = async (data) => {
    return permissionModel.create(data);
};

const updatePermission = async (id, data) => {
    return permissionModel.update(id, data);
};

const binPermission = async (id) => {
    return permissionModel.bin(id);
};

const restorePermission = async (id) => {
    return permissionModel.restore(id);
};

const deletePermission = async (id) => {
    return permissionModel.delete(id);
};

export default {
    getAllPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    binPermission,
    restorePermission,
    deletePermission,
};