import BaseModel from "../../../shared/models/baseModel.js";
import AppError from "../../../shared/utils/AppError.js";

class ConnectionsRepository extends BaseModel {
    constructor() {
        super('connections');
        this.selectFields = [
            'connections.*',
            'req.first_name as requester_first_name',
            'req.last_name as requester_last_name',
            'req.avatar as requester_avatar',
            'rec.first_name as receiver_first_name',
            'rec.last_name as receiver_last_name',
            'rec.avatar as receiver_avatar',
        ];
        this.searchFields = ['req.first_name', 'req.last_name', 'rec.first_name', 'rec.last_name'];
        this.joins = [
            { table: 'users', alias: 'req', on: ['connections.requester_id', 'req.id'] },
            { table: 'users', alias: 'rec', on: ['connections.receiver_id', 'rec.id'] },
        ];
        this.filterMapping = {
            requester_id: 'connections.requester_id',
            receiver_id: 'connections.receiver_id',
            status: 'connections.status',
        };
    }

    async checkDuplicate(requesterId, receiverId) {
        if (requesterId === receiverId) {
            throw new AppError('No puedes conectarte contigo mismo', 400);
        }

        const existing = await this.knex('connections')
            .where(function () {
                this.where({ requester_id: requesterId, receiver_id: receiverId })
                    .orWhere({ requester_id: receiverId, receiver_id: requesterId });
            })
            .whereNull('deleted_at')
            .first();

        if (existing) {
            throw new AppError('Ya existe una conexión entre estos usuarios', 409);
        }
    }
}

export default new ConnectionsRepository();