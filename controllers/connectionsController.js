import ConnectionsService from '../services/ConnectionsService.js';
import ApiResponse from '../utils/apiResponse.js';

class UserConnectionsController {
    async getAll(req, res) {
        try {
            const result = await ConnectionsService.getAllConnections(req.query);
            ApiResponse.success(res, 200, 'Conexiones obtenidas correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const connection = await ConnectionsService.getConnectionById(id);
            ApiResponse.success(res, 200, 'Conexión obtenida correctamente', connection);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getMyConnections(req, res) {
        try {
            const userId = req.user.id;
            const { status } = req.query;
            const connections = await ConnectionsService.getByUser(userId, status);
            ApiResponse.success(res, 200, 'Conexiones obtenidas correctamente', connections);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async request(req, res) {
        try {
            const requesterId = req.user.id;
            const { receiver_id } = req.body;
            const result = await ConnectionsService.requestConnection(requesterId, receiver_id);
            ApiResponse.success(res, 201, 'Solicitud de conexión enviada correctamente', { connection: result });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async accept(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await ConnectionsService.acceptConnection(id, userId);
            ApiResponse.success(res, 200, 'Conexión aceptada correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async reject(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await ConnectionsService.rejectConnection(id, userId);
            ApiResponse.success(res, 200, 'Conexión rechazada correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async remove(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await ConnectionsService.removeConnection(id, userId);
            ApiResponse.success(res, 200, 'Conexión eliminada correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new UserConnectionsController();
