// controllers/blocksController.js
const BaseController = require('./BaseController');

class blocksController extends BaseController {
    constructor() {
        super('blocks');
    }

    // Métodos específicos para Classes pueden agregarse aquí si es necesario.
    async create(req, res) {
        try {
            const { name, description, module_id } = req.body;
            
            const lastBlock = await this.knex(this.tableName)
                .where({ module_id })
                .orderBy('order', 'desc')
                .first();            

            const nextOrder = lastBlock ? lastBlock.order + 1 : 0;

            const newBlock = {
                module_id,
                name: name,
                description: description || '',
                order: nextOrder,
                collapsible: false,
                display_mode: 'edit',
            };

            await this.knex(this.tableName).insert(newBlock);

            res.status(201).json({ message: `${this.tableName} record created successfully` });
        } catch (error) {
            res.status(500).json({ message: `Error creating ${this.tableName} record`, error });
        }
    }
}

module.exports = new blocksController();
