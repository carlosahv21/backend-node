// controllers/usersController.js
const BaseController = require('./BaseController');

class UsersController extends BaseController {
    constructor() {
        super('users');
        this.searchFields = ['first_name', 'last_name', 'email'];
        this.validations = [
            { name: "uniqueField", config: { field: "email" } },
        ];
    }

    // Métodos específicos para Users pueden agregarse aquí si es necesario.
}

module.exports = new UsersController();