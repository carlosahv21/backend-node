// controllers/permissionsController.js
const BaseController = require('./BaseController');

class permissionsController extends BaseController {
    constructor() {
        super('permissions');
        this.searchFields = ['name', 'description'];
        this.validations = [
            { name: "uniqueField", config: { field: "name" } },
        ];
    }

    // Métodos específicos para permissions pueden agregarse aquí si es necesario.
}

module.exports = new permissionsController();