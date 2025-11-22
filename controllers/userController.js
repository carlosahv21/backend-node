// controllers/userController.js (Clase puramente delegada)
const userService = require('../services/userService');
const utilsCustomError = require('../utils/utilsCustomError');
const userModel = require('../models/userModel'); // Se importa para el CRUD simple (findById)

/**
 * Clase controladora para Usuarios. 
 * Su única responsabilidad es manejar la interfaz HTTP (req, res, next) 
 * y delegar la lógica de negocio al servicio.
 */
class UserController {

    /**
     * Obtiene todos los usuarios.
     */
    async getAll(req, res, next) {
        try {
            const result = await userService.getAllUsers(req.query);

            res.status(200).json(result);
        } catch (error) {
            // Propaga el error de negocio al middleware de manejo de errores
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Obtiene un usuario por ID. 
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await userModel.findById(id);
            res.status(200).json(user);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }


    /**
     * Crea un nuevo usuario.
     */
    async create(req, res, next) {
        try {
            const newUser = await userService.createUser(req.body);

            res.status(201).json({
                message: "Usuario creado correctamente",
                user: newUser
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Actualiza un usuario.
     */
    async update(req, res, next) {
        try {
            await userService.updateUser(req.params.id, req.body);

            res.status(200).json({
                message: "Usuario actualizado correctamente"
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Elimina un usuario.
     */
    async delete(req, res, next) {
        try {
            await userService.deleteUser(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }
}

module.exports = new UserController();