import paymentService from './payment.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class PaymentController {
    async getAll(req, res, next) {
        try {
            const result = await paymentService.getAllPayments(req.query);
            ApiResponse.success(res, 200, "Pagos obtenidos correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const payment = await paymentService.getPaymentById(id);
            ApiResponse.success(res, 200, "Pago obtenido correctamente", payment);
        } catch (error) {
            next(error);
        }
    }

    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const paymentDetails = await paymentService.getPaymentByIdDetails(id);
            ApiResponse.success(res, 200, "Detalles del pago obtenidos correctamente", paymentDetails);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newPayment = await paymentService.createPayment(req.body);
            ApiResponse.success(res, 201, "Pago creado correctamente", newPayment);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updatedPayment = await paymentService.updatePayment(req.params.id, req.body);
            ApiResponse.success(res, 200, "Pago actualizado correctamente", updatedPayment);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await paymentService.deletePayment(req.params.id);
            ApiResponse.success(res, 204, "Pago eliminado correctamente");
        } catch (error) {
            next(error);
        }
    }
}

export default new PaymentController();