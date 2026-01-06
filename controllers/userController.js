// controllers/userController.js
import userService from '../services/userService.js';
import utilsCustomError from '../utils/utilsCustomError.js';
import userModel from '../models/userModel.js';

/**
 * Clase controladora para Usuarios.
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
            const { email } = req.body;

            const user = await userModel.findByEmail(email);
            if (user) {
                throw new utilsCustomError("Ya existe un usuario con el correo electrónico proporcionado", 400);
            }

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
            res.status(200).json({
                message: "Usuario eliminado correctamente"
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }
}

export default new UserController();