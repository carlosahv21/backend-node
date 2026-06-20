// auth.controller.js
import authService from "./auth.service.js";
import ApiResponse from "../../../shared/utils/apiResponse.js";
import AppError from "../../../shared/utils/AppError.js";

class AuthController {
    async login(req, res, next) {
        try {
            const result = await authService.authenticateUser(req.body);
            ApiResponse.success(res, 200, "Login successful", result);
        } catch (err) {
            const status = err.statusCode || 400;
            ApiResponse.error(res, status, err.message);
        }
    }

    async me(req, res, next) {
        try {
            const userId = req.user.id;
            const data = await authService.getAuthenticatedUser(userId);
            ApiResponse.success(res, 200, "Perfil de usuario obtenido correctamente", data);
        } catch (err) {
            const status = err.statusCode || 400;
            ApiResponse.error(res, status, err.message);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) throw new AppError("Email is required", 400);

            const result = await authService.forgotPassword(email);
            ApiResponse.success(res, 200, result.message);
        } catch (err) {
            const status = err.statusCode || 400;
            ApiResponse.error(res, status, err.message);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token } = req.params;
            const { password } = req.body;

            if (!token) throw new AppError("Token is required", 400);
            if (!password) throw new AppError("New password is required", 400);

            const result = await authService.resetPasswordWithToken(token, password);
            ApiResponse.success(res, 200, result.message, result);
        } catch (err) {
            const status = err.statusCode || 400;
            ApiResponse.error(res, status, err.message);
        }
    }

    async verifyToken(req, res, next) {
        try {
            const { token } = req.params;
            if (!token) throw new AppError("Token is required", 400);

            const result = await authService.verifyResetToken(token);
            ApiResponse.success(res, 200, result.message, result);
        } catch (err) {
            const status = err.statusCode || 400;
            ApiResponse.error(res, status, err.message);
        }
    }

    async changePassword(req, res, next) {
        try {
            const { current_password, new_password } = req.body;

            if (!current_password) throw new AppError("Current password is required", 400);
            if (!new_password) throw new AppError("New password is required", 400);

            // Opera siempre sobre el usuario del token, nunca sobre un email del body.
            const result = await authService.changePassword(
                req.user.id,
                current_password,
                new_password
            );
            ApiResponse.success(res, 200, result.message);
        } catch (err) {
            const status = err.statusCode || 400;
            ApiResponse.error(res, status, err.message);
        }
    }
}

export default new AuthController();