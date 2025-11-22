// services/permissionService.js
const permissionModel = require('../models/permissionModel');
const utilsCustomError = require('../utils/utilsCustomError');


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

const deletePermission = async (id) => {
    return permissionModel.delete(id);
};

module.exports = {
    getAllPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    deletePermission,
};