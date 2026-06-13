import challengesService from '../services/challengesService.js';
import ApiResponse from '../utils/apiResponse.js';

class ChallengesController {
    async getAll(req, res) {
        try {
            const result = await challengesService.getAllChallenges(req.query);
            ApiResponse.success(res, 200, 'Retos obtenidos correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const challenge = await challengesService.getChallengeById(id);
            ApiResponse.success(res, 200, 'Reto obtenido correctamente', challenge);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res) {
        try {
            const newChallenge = await challengesService.createChallenge(req.body);
            ApiResponse.success(res, 201, 'Reto creado correctamente', { challenge: newChallenge });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res) {
        try {
            await challengesService.updateChallenge(req.params.id, req.body);
            ApiResponse.success(res, 200, 'Reto actualizado correctamente');
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bin(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await challengesService.binChallenge(id, userId);
            ApiResponse.success(res, 200, 'Reto movido a papelera correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restore(req, res) {
        try {
            const { id } = req.params;
            const result = await challengesService.restoreChallenge(id);
            ApiResponse.success(res, 200, 'Reto restaurado correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res) {
        try {
            await challengesService.deleteChallenge(req.params.id);
            ApiResponse.success(res, 204, 'Reto eliminado correctamente');
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new ChallengesController();
