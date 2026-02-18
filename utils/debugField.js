import fieldModel from '../models/fieldModel.js';

const fields = await fieldModel.findFieldsByModuleName('payments');
const paymentDateField = fields.find(f => f.name === 'payment_date');

console.log('Payment Date Field:', JSON.stringify(paymentDateField, null, 2));
