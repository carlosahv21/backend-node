import paymentRepository from './payment.repository.js';

class PaymentService {
    async getAllPayments(queryParams) {
        return paymentRepository.findAll(queryParams);
    }

    async getPaymentById(id) {
        return paymentRepository.findById(id);
    }

    async getPaymentByIdDetails(id) {
        return paymentRepository.findByIdDetails(id);
    }

    async createPayment(data) {
        return paymentRepository.create(data);
    }

    async updatePayment(id, data) {
        return paymentRepository.update(id, data);
    }

    async deletePayment(id) {
        return paymentRepository.delete(id);
    }
}

export default new PaymentService();