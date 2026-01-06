// controllers/paymentController.js
import PaymentService from '../services/paymentService.js';
import ApiResponse from '../utils/apiResponse.js';

class PaymentController {
    async getAll(req, res, next) {
        try {
            const result = await PaymentService.getAll(req.query);
            ApiResponse.success(res, 200, "Pagos obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.getById(id);
            ApiResponse.success(res, 200, "Pago obtenido correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getDetails(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.getDetails(id);
            ApiResponse.success(res, 200, "Detalles del pago obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const result = await PaymentService.create(req.body);
            ApiResponse.success(res, 201, "Pago creado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.update(id, req.body);
            ApiResponse.success(res, 200, "Pago actualizado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.delete(id);
            ApiResponse.success(res, 200, "Pago eliminado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new PaymentController();
