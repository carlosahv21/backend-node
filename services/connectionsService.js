import ConnectionsModel from '../models/ConnectionsModel.js';
import AppError from '../utils/AppError.js';

class UserConnectionsService {
    async getAllConnections(queryParams) {
        return ConnectionsModel.findAll(queryParams);
    }

    async getConnectionById(id) {
        return ConnectionsModel.findById(id);
    }

    async getByUser(userId, status = null) {
        const db = ConnectionsModel.knex;
        const query = db('connections as uc')
            .leftJoin('users as req', 'uc.requester_id', 'req.id')
            .leftJoin('users as rec', 'uc.receiver_id', 'rec.id')
            .where(function () {
                this.where('uc.requester_id', userId).orWhere('uc.receiver_id', userId);
            })
            .whereNull('uc.deleted_at')
            .select(
                'uc.*',
                db.raw('CASE WHEN uc.requester_id = ? THEN rec.first_name ELSE req.first_name END as other_first_name', [userId]),
                db.raw('CASE WHEN uc.requester_id = ? THEN rec.last_name ELSE req.last_name END as other_last_name', [userId]),
                db.raw('CASE WHEN uc.requester_id = ? THEN rec.avatar ELSE req.avatar END as other_avatar', [userId]),
                db.raw('CASE WHEN uc.requester_id = ? THEN uc.receiver_id ELSE uc.requester_id END as other_user_id', [userId]),
            );

        if (status) {
            query.where('uc.status', status);
        }

        return query.orderBy('uc.created_at', 'desc');
    }

    async requestConnection(requesterId, receiverId) {
        await ConnectionsModel.checkDuplicate(requesterId, receiverId);

        return ConnectionsModel.create({
            requester_id: requesterId,
            receiver_id: receiverId,
            status: 'pending',
        });
    }

    async acceptConnection(id, userId) {
        const db = ConnectionsModel.knex;

        const connection = await db('connections')
            .where('id', id)
            .where('receiver_id', userId)
            .where('status', 'pending')
            .whereNull('deleted_at')
            .first();

        if (!connection) {
            throw new AppError('Conexión no encontrada o ya procesada', 404);
        }

        return ConnectionsModel.update(id, { status: 'accepted' });
    }

    async rejectConnection(id, userId) {
        const db = ConnectionsModel.knex;

        const connection = await db('connections')
            .where('id', id)
            .where('receiver_id', userId)
            .where('status', 'pending')
            .whereNull('deleted_at')
            .first();

        if (!connection) {
            throw new AppError('Conexión no encontrada o ya procesada', 404);
        }

        return ConnectionsModel.update(id, { status: 'rejected' });
    }

    async removeConnection(id, userId) {
        const db = ConnectionsModel.knex;

        const connection = await db('connections')
            .where('id', id)
            .where(function () {
                this.where('requester_id', userId).orWhere('receiver_id', userId);
            })
            .whereNull('deleted_at')
            .first();

        if (!connection) {
            throw new AppError('Conexión no encontrada', 404);
        }

        return ConnectionsModel.bin(id, userId);
    }
}

export default new UserConnectionsService();
