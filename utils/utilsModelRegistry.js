import UserModel from '../models/userModel.js';
import ClassModel from '../models/classModel.js';
import PaymentModel from '../models/paymentModel.js';
import PlanModel from '../models/planModel.js';
import StudentModel from '../models/studentModel.js';
import TeacherModel from '../models/teacherModel.js';

/**
 * Registro centralizado de modelos.
 */
const modelRegistry = {
    'users': UserModel,
    'classes': ClassModel,
    'payments': PaymentModel,
    'plans': PlanModel,
    'students': StudentModel,
    'teachers': TeacherModel
};

/**
 * Función que permite obtener la instancia de un modelo dado el nombre de la tabla.
 */
export function getModelInstance(tableName) {
    const key = tableName.toLowerCase(); 
    return modelRegistry[key] || null;
}