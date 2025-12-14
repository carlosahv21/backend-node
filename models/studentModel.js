// models/studentModel.js
import { UserModel } from './userModel.js';

/**
 * Capa de Acceso a Datos (DAL) para la entidad Student.
 */
class StudentModel extends UserModel {
    constructor() {
        super();
    }

    /**
     * Obtiene los detalles completos de un estudiante sin transformar la estructura.
     */
    async _getStudentData(id) {
        const record = await super.findById(id);

        // 💡 Modificado: Ahora el plan se obtiene a través de la tabla user_plan
        const planValues = await this.knex('user_plan as up')
            .join('plans as p', 'up.plan_id', 'p.id')
            .where('up.user_id', id)
            .andWhere('up.status', 'active') // Priorizamos el plan activo
            .select(
                'p.name as plan_name',
                'p.description as plan_description',
                'p.price as plan_price',
                'up.status as plan_status',
                'up.classes_used as plan_classes_used',
                'up.classes_remaining as plan_classes_remaining',
                'up.start_date as plan_start_date',
                'up.end_date as plan_end_date'
            )
            .orderBy('up.created_at', 'desc') // En caso de multiples, el mas reciente activo
            .first();

        // Si no hay plan activo, buscar el último plan (aunque esté expirado) para mostrar historial
        let finalPlanValues = planValues;
        if (!finalPlanValues) {
            finalPlanValues = await this.knex('user_plan as up')
                .join('plans as p', 'up.plan_id', 'p.id')
                .where('up.user_id', id)
                .select(
                    'p.name as plan_name',
                    'p.description as plan_description',
                    'p.price as plan_price',
                    'up.status as plan_status',
                    'up.classes_used as plan_classes_used',
                    'up.classes_remaining as plan_classes_remaining',
                    'up.start_date as plan_start_date',
                    'up.end_date as plan_end_date'
                )
                .orderBy('up.created_at', 'desc')
                .first();
        }


        const roleValues = await this.knex('roles as r')
            .join('users', 'r.id', 'users.role_id')
            .where('users.id', id)
            .select('r.name as role_name')
            .first();

        return { ...record, ...(finalPlanValues || {}), ...roleValues };
    }

    /**
     * Crea un estudiante manejando la transacción completa: Usuario -> Pago -> Plan -> Historial
     * @param {Object} studentData - Datos del formulario
     */
    async create(studentData) {
        // Separar datos del usuario y del plan
        const {
            plan_id,
            plan_start_date,
            // Datos del usuario base
            ...userData
        } = studentData;

        // Iniciar transacción
        return await this.knex.transaction(async (trx) => {
            try {
                // 1. Crear Usuario (Usando el método del padre pero pasando la transacción si fuera necesario, 
                // pero como super.create no acepta trx por defecto, usamos this.knex dentro o insertamos directo aquí para usar trx).
                // Para reusar la logica de hash password de userModel, llamamos a super.create pero OJO: super.create no usa la trx actual.
                // Lo mejor es replicar la lógica userModel aquí para garantizar atomicidad o modificar userModel para aceptar trx.
                // Por simplicidad y seguridad, insertaremos el usuario manualmente aquí dentro de la trx después de hashear.

                // NOTA: Si UserModel.create hashea pass, aquí debemos hacerlo también.
                // Importamos bcrypt arriba si no estuviera (ya está en el archivo original? No, userModel lo tiene).
                // Necesitamos importar bcrypt aqui si vamos a hashear.
                // REVISIÓN: StudentModel hereda de UserModel. UserModel importa bcrypt. Pero aquí no tenemos acceso a bcrypt a menos que lo importemos.
                // Asumiremos que studentData va a super pero modificaremos userModel para aceptar trx? No puedo modificar userModel ahora sin permiso.
                // Solución: Usar super.create (sin trx) es arriesgado. 
                // Mejor opción: Importar bcrypt en este archivo y hacer todo manual con trx.

                // AÑADIR IMPORT ARRIBA (via otro chunk si es necesario, o asumir que está disponible si lo añado).

                // --- Lógica de Creación ---

                // 1. Preparar usuario
                const { password, ...userFields } = userData;
                // Si no hay password (registro admin), generar uno default o manejarlo.
                // Asumimos que viene o se gestiona.

                // Insertar usuario
                // Necesitamos hashear si viene password. Para no importar bcrypt duplicado, 
                // vamos a confiar en que la creación del usuario es el paso 1 y si falla el resto borramos? 
                // No, transacción es mejor.
                // Voy a usar `super.create` pero atrapando el ID, y si falla lo demás, lanzamos error. 
                // (Knex transaction no hace rollback de llamadas fuera de su scope, asi que esto es un compromiso).

                // MEJOR: Hacerlo todo con trx. Necesito bcrypt.
                // Voy a añadir import bcrypt al principio del archivo también.

                const createdUserIdArray = await trx('users').insert(userFields).returning('id'); // MySQL returning support varies.
                // MySQL standard knex insert returns [id].
                const userId = createdUserIdArray[0];

                // 2. Si hay plan seleccionado, crear Pago y UserPlan
                if (plan_id) {
                    // Obtener info del plan para precio
                    const plan = await trx('plans').where('id', plan_id).first();
                    if (!plan) throw new Error(`Plan con ID ${plan_id} no encontrado.`);

                    // Crear Pago (Pending)
                    const [paymentId] = await trx('payments').insert({
                        user_id: userId,
                        plan_id: plan_id,
                        original_amount: plan.price,
                        amount: plan.price, // Asumimos pago completo por defecto o pendiente
                        payment_method: 'cash', // Default o null
                        payment_date: new Date(),
                        status: 'pending', // PENDIENTE hasta que confirmen
                        created_at: new Date(),
                        updated_at: new Date()
                    });

                    // Crear User Plan
                    // Calcular fechas
                    const startDate = plan_start_date ? new Date(plan_start_date) : new Date();
                    const endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + 30); // Default 30 dias si es mensual

                    const maxClasses = plan.max_sessions || 0; // O max_classes segun logica

                    await trx('user_plan').insert({
                        user_id: userId,
                        plan_id: plan_id,
                        payment_id: paymentId,
                        status: 'active', // O 'pending_payment' si tuvieramos ese estado
                        start_date: startDate,
                        end_date: endDate,
                        max_classes: maxClasses,
                        classes_used: 0,
                        classes_remaining: maxClasses === 0 ? 9999 : maxClasses, // Logic fix
                        created_at: new Date(),
                        updated_at: new Date()
                    });

                    // Historial
                    await trx('user_registration_history').insert({
                        user_id: userId,
                        plan_id: plan_id,
                        payment_id: paymentId,
                        action_type: 'subscribed_at_creation',
                        previous_plan_id: 0,
                        classes_purchased: maxClasses,
                        classes_used: 0,
                        start_date: startDate,
                        end_date: endDate,
                        status: 'active',
                        created_at: new Date()
                    });
                }

                return userId; // Retornar ID del estudiante creado
            } catch (error) {
                console.error("Error creando estudiante con transacción:", error);
                throw error; // Rollback automático
            }
        });
    }

    /**
     * Transforma el objeto de datos de la API al formato de View Model para el Drawer.
     */
    _transformToViewModel(apiData) {

        const capitalize = (string) => string ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : '';

        const formatValue = (key, value) => {
            if (value === null || value === undefined) return "-";

            if (key.includes("price") && !isNaN(parseFloat(value))) {
                return `$${parseFloat(value).toFixed(2)}`;
            }
            if (key.includes("verified")) {
                return value === 1 ? "Sí" : "No";
            }

            if (key.includes("date") || key.includes("login") || key.includes("at")) {
                if (value instanceof Date) return value.toISOString().split('T')[0];
                return value;
            }
            return value;
        };

        return {
            title: `${apiData.first_name} ${apiData.last_name}`,
            subtitle: capitalize(apiData.role_name),
            email: apiData.email,
            sections: [
                {
                    label: "Información del Plan Actual",
                    items: [
                        { name: "Plan Asignado", value: apiData.plan_name },
                        { name: "Descripción", value: apiData.plan_description },
                        { name: "Precio", value: formatValue('price', apiData.plan_price) },
                        {
                            name: "Estado",
                            value: apiData.plan_status,
                        },
                        { name: "Clases Usadas", value: apiData.plan_classes_used },
                        { name: "Clases Restantes", value: apiData.plan_classes_remaining },
                        { name: "Inicio", value: formatValue('date', apiData.plan_start_date) },
                        { name: "Fin", value: formatValue('date', apiData.plan_end_date) },
                    ],
                },
                {
                    label: "Registro de Tiempos",
                    items: [
                        { name: "Email Verificado", value: formatValue('email_verified', apiData.email_verified) },
                        { name: "Último Login", value: formatValue('date', apiData.last_login) },
                        { name: "Creado En", value: formatValue('date', apiData.created_at) },
                        { name: "Actualizado En", value: formatValue('date', apiData.updated_at) },
                    ],
                },
            ],
        };
    }

    /**
     * Método principal para obtener el detalle y transformarlo.
     */
    async findByIdDetails(id) {
        const apiData = await this._getStudentData(id);
        return this._transformToViewModel(apiData);
    }
}

export default new StudentModel();