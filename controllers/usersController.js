// controllers/usersController.js
const BaseController = require('./BaseController');

class UsersController extends BaseController {
    joins = [
        { table: "user_roles", alias: "ur", on: ["users.id", "ur.user_id"] },
        { table: "roles", alias: "r", on: ["ur.role_id", "r.id"] }
    ];

    selectFields = ["users.*", "r.name as role_name"];

    searchFields = ["users.first_name", "users.last_name", "users.email", "r.name"];

    constructor() {
        super("users");
    }
}

module.exports = new UsersController();