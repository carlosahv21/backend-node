import paymentService from './payment.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class PaymentController {
    async getAll(req, res, next) {
        try {
            const result = await paymentService.getAllPayments(req.query);
            ApiResponse.success(res, 200, "Pagos obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const payment = await paymentService.getPaymentById(id);
            ApiResponse.success(res, 200, "Pago obtenido correctamente", payment);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const paymentDetails = await paymentService.getPaymentByIdDetails(id);
            ApiResponse.success(res, 200, "Detalles del pago obtenidos correctamente", paymentDetails);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const newPayment = await paymentService.createPayment(req.body);
            ApiResponse.success(res, 201, "Pago creado correctamente", newPayment);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res, next) {
        try {
            const updatedPayment = await paymentService.updatePayment(req.params.id, req.body);
            ApiResponse.success(res, 200, "Pago actualizado correctamente", updatedPayment);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            await paymentService.deletePayment(req.params.id);
            ApiResponse.success(res, 204, "Pago eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new PaymentController();