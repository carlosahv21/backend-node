// controllers/rolesController.js
const BaseController = require('./BaseController');

class RolesController extends BaseController {
    constructor() {
        super('roles');
        this.searchFields = ['name'];
    }

}

module.exports = new RolesController();