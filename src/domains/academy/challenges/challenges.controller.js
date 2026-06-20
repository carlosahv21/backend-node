import challengesService from './challenges.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class ChallengesController {
    async getAll(req, res, next) {
        try {
            const result = await challengesService.getAllChallenges(req.query);
            ApiResponse.success(res, 200, "Desafíos obtenidos correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const challenge = await challengesService.getChallengeById(id);
            ApiResponse.success(res, 200, "Desafío obtenido correctamente", challenge);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newChallenge = await challengesService.createChallenge(req.body);
            ApiResponse.success(res, 201, "Desafío creado correctamente", newChallenge);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updatedChallenge = await challengesService.updateChallenge(req.params.id, req.body);
            ApiResponse.success(res, 200, "Desafío actualizado correctamente", updatedChallenge);
        } catch (error) {
            next(error);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await challengesService.binChallenge(req.params.id);
            ApiResponse.success(res, 200, "Desafío movido a papelera correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await challengesService.restoreChallenge(req.params.id);
            ApiResponse.success(res, 200, "Desafío restaurado correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await challengesService.deleteChallenge(req.params.id);
            ApiResponse.success(res, 204, "Desafío eliminado correctamente");
        } catch (error) {
            next(error);
        }
    }
}

export default new ChallengesController();