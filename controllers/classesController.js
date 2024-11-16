// controllers/classesController.js
const BaseController = require('./BaseController');

class ClassesController extends BaseController {
    constructor() {
        super('classes');
    }

    // Métodos específicos para Classes pueden agregarse aquí si es necesario.
}

module.exports = new ClassesController();
