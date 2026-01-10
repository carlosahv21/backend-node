// controllers/registrationController.js
import RegistrationService from '../services/registrationService.js';
import ApiResponse from '../utils/apiResponse.js';

const createRegistration = async (req, res, next) => {
    try {
        const result = await RegistrationService.create(req.body);
        ApiResponse.success(res, 201, "Registration created successfully", result);
    } catch (error) {
        const status = error.statusCode || 500;
        ApiResponse.error(res, status, error.message);
    }
};

const listRegistrations = async (req, res, next) => {
    try {
        const queryParams = req.query;
        const result = await RegistrationService.list(queryParams);
        ApiResponse.success(res, 200, "Registrations retrieved successfully", result);
    } catch (error) {
        const status = error.statusCode || 500;
        ApiResponse.error(res, status, error.message);
    }
};

const deleteRegistration = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await RegistrationService.delete(id);
        ApiResponse.success(res, 204, "Registration deleted successfully");
    } catch (error) {
        const status = error.statusCode || 500;
        ApiResponse.error(res, status, error.message);
    }
};

const getAvailableClasses = async (req, res, next) => {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            return ApiResponse.error(res, 400, "user_id is required");
        }
        const result = await RegistrationService.getAvailableClasses(user_id, req.query);
        ApiResponse.success(res, 200, "Available classes retrieved successfully", result);
    } catch (error) {
        const status = error.statusCode || 500;
        ApiResponse.error(res, status, error.message);
    }
};

const binRegistration = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await RegistrationService.bin(id);
        ApiResponse.success(res, 200, "Registration moved to bin successfully", result);
    } catch (error) {
        const status = error.statusCode || 500;
        ApiResponse.error(res, status, error.message);
    }
};

const restoreRegistration = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await RegistrationService.restore(id);
        ApiResponse.success(res, 200, "Registration restored successfully", result);
    } catch (error) {
        const status = error.statusCode || 500;
        ApiResponse.error(res, status, error.message);
    }
};

export {
    createRegistration,
    listRegistrations,
    binRegistration,
    restoreRegistration,
    deleteRegistration,
    getAvailableClasses
};

