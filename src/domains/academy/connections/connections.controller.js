import connectionsService from './connections.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class ConnectionsController {
    async getAll(req, res) {
        try {
            const result = await connectionsService.getAllConnections(req.query);
            ApiResponse.success(res, 200, 'Conexiones obtenidas correctamente', result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const connection = await connectionsService.getConnectionById(id);
            ApiResponse.success(res, 200, 'Conexión obtenida correctamente', connection);
        } catch (error) {
            next(error);
        }
    }

    async getMyConnections(req, res) {
        try {
            const userId = req.user.id;
            const { status } = req.query;
            const connections = await connectionsService.getByUser(userId, status);
            ApiResponse.success(res, 200, 'Conexiones obtenidas correctamente', connections);
        } catch (error) {
            next(error);
        }
    }

    async request(req, res) {
        try {
            const requesterId = req.user.id;
            const { receiver_id } = req.body;
            const result = await connectionsService.requestConnection(requesterId, receiver_id);
            ApiResponse.success(res, 201, 'Solicitud de conexión enviada correctamente', { connection: result });
        } catch (error) {
            next(error);
        }
    }

    async accept(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await connectionsService.acceptConnection(id, userId);
            ApiResponse.success(res, 200, 'Conexión aceptada correctamente', result);
        } catch (error) {
            next(error);
        }
    }

    async reject(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await connectionsService.rejectConnection(id, userId);
            ApiResponse.success(res, 200, 'Conexión rechazada correctamente', result);
        } catch (error) {
            next(error);
        }
    }

    async remove(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await connectionsService.removeConnection(id, userId);
            ApiResponse.success(res, 200, 'Conexión eliminada correctamente', result);
        } catch (error) {
            next(error);
        }
    }
}

export default new ConnectionsController();