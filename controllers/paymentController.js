// controllers/paymentController.js
import PaymentService from '../services/paymentService.js';
import ApiResponse from '../utils/apiResponse.js';

class paymentController {
    async getAllPayments(req, res, next) {
        try {
            const result = await PaymentService.getAllPayments(req.query);
            ApiResponse.success(res, 200, "Pagos obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getPaymentById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.getPaymentById(id);
            ApiResponse.success(res, 200, "Pago obtenido correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getPaymentDetails(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.getPaymentDetails(id);
            ApiResponse.success(res, 200, "Detalles del pago obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async createPayment(req, res, next) {
        try {
            const result = await PaymentService.createPayment(req.body);
            ApiResponse.success(res, 201, "Pago creado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async updatePayment(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.updatePayment(id, req.body);
            ApiResponse.success(res, 200, "Pago actualizado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async deletePayment(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.deletePayment(id);
            ApiResponse.success(res, 204, "Pago eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async binPayment(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await PaymentService.binPayment(id, userId);
            ApiResponse.success(res, 200, "Pago movido a papelera correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restorePayment(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.restorePayment(id);
            ApiResponse.success(res, 200, "Pago restaurado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new paymentController();
