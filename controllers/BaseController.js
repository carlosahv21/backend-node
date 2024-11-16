// controllers/BaseController.js
const knex = require('../db/knex');

class BaseController {
    constructor(tableName) {
        this.tableName = tableName;
        this.knex = knex;
    }

    // Obtener todos los registros con paginación, búsqueda y filtros
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search, filterField, filterValue } = req.query;
            let query = this.knex(this.tableName);

            if (search && filterField) {
                query = query.where(filterField, 'like', `%${search}%`);
            }

            if (filterField && filterValue) {
                query = query.where(filterField, filterValue);
            }

            const results = await query.limit(limit).offset((page - 1) * limit);
            const total = await this.knex(this.tableName).count('* as count').first();

            res.json({
                data: results,
                total: total.count,
                page: parseInt(page),
                limit: parseInt(limit)
            });
        } catch (error) {
            res.status(500).json({ message: `Error retrieving ${this.tableName} records`, error });
        }
    }

    // Obtener un registro por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const record = await this.knex(this.tableName).where({ id }).first();

            if (!record) {
                return res.status(404).json({ message: `${this.tableName} record not found` });
            }

            res.json(record);
        } catch (error) {
            res.status(500).json({ message: `Error retrieving ${this.tableName} record`, error });
        }
    }

    // Crear un registro
    async create(req, res) {
        try {
            const data = req.body;
            await this.knex(this.tableName).insert(data);

            res.status(201).json({ message: `${this.tableName} record created successfully` });
        } catch (error) {
            res.status(500).json({ message: `Error creating ${this.tableName} record`, error });
        }
    }

    // Actualizar un registro existente
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const updatedCount = await this.knex(this.tableName).where({ id }).update(data);

            if (updatedCount === 0) {
                return res.status(404).json({ message: `${this.tableName} record not found` });
            }

            res.json({ message: `${this.tableName} record updated successfully` });
        } catch (error) {
            res.status(500).json({ message: `Error updating ${this.tableName} record`, error });
        }
    }

    // Eliminar un registro
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedCount = await this.knex(this.tableName).where({ id }).del();

            if (deletedCount === 0) {
                return res.status(404).json({ message: `${this.tableName} record not found` });
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: `Error deleting ${this.tableName} record`, error });
        }
    }
}

module.exports = BaseController;
