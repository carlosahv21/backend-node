import userRepository from '../../domains/security/users/user.repository.js';
import classRepository from '../../domains/academy/classes/class.repository.js';
import paymentRepository from '../../domains/billing/payments/payment.repository.js';
import planRepository from '../../domains/billing/plans/plan.repository.js';
import studentRepository from '../../domains/academy/students/student.repository.js';
import teacherRepository from '../../domains/academy/teachers/teacher.repository.js';

const modelRegistry = {
    'users': userRepository,
    'classes': classRepository,
    'payments': paymentRepository,
    'plans': planRepository,
    'students': studentRepository,
    'teachers': teacherRepository
};

export function getModelInstance(tableName) {
    const key = tableName.toLowerCase();
    return modelRegistry[key] || null;
}