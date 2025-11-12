// controllers/rolesController.js
const BaseController = require('./BaseController');

class RolesController extends BaseController {
    searchFields = ['name'];

    constructor() {
        super('roles');
    }
}

module.exports = new RolesController();