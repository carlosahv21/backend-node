// controllers/permissionsController.js
const BaseController = require('./BaseController');

class permissionsController extends BaseController {
    searchFields = ['name', 'description'];

    validations = [
        { name: "uniqueField", config: { field: "name" } },
    ];

    constructor() {
        super('permissions');
    }
}

module.exports = new permissionsController();