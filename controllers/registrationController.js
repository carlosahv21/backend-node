// controllers/registrationController.js
import RegistrationService from '../services/registrationService.js';

export const createRegistration = async (req, res, next) => {
    try {
        const result = await RegistrationService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const listRegistrations = async (req, res, next) => {
    try {
        const { user_id, ...queryParams } = req.query;
        const result = await RegistrationService.list(user_id, queryParams);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const deleteRegistration = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await RegistrationService.delete(id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getAvailableClasses = async (req, res, next) => {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            return res.status(400).json({ message: 'user_id is required' });
        }
        const result = await RegistrationService.getAvailableClasses(user_id, req.query);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
