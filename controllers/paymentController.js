// controllers/paymentController.js
import PaymentService from '../services/paymentService.js';

class PaymentController {
    async getAll(req, res, next) {
        try {
            const result = await PaymentService.getAll(req.query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.getById(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getDetails(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.getDetails(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const result = await PaymentService.create(req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.update(id, req.body);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const result = await PaymentService.delete(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default new PaymentController();
