import BaseModel from './baseModel.js';

class RegistrationModel extends BaseModel {
    constructor() {
        super('user_class');
        this.softDelete = false;

        this.joins = [
            { table: "classes", alias: "c", on: ["user_class.class_id", "c.id"] },
            { table: "users", alias: "u", on: ["user_class.user_id", "u.id"] },
            { table: "payments", alias: "pay", on: ["u.id", "pay.user_id"] }
        ];

        this.selectFields = [
            "user_class.*",
            "c.name as class_name",
            "c.hour as class_hour",
            "c.date as class_date",
            "c.level as class_level",
            "c.genre as class_genre",
            "u.first_name as user_first_name",
            "u.last_name as user_last_name",
            "pay.payment_method as payment_method"
        ];

        this.searchFields = ["c.name", "c.hour", "c.date", "u.first_name", "u.last_name"];

        this.filterMapping = {
            'class_id': 'user_class.class_id',
            'user_id': 'user_class.user_id',
            'payment_method': 'pay.payment_method',
            'payment_date': 'pay.payment_date'
        };

        this.orderMapping = {
            'user_first_name': 'u.first_name',
            'user_last_name': 'u.last_name'
        };

        this.relationMaps = {
            'default': {
                joins: this.joins,
                column_map: this.filterMapping,
                order_map: this.orderMapping
            }
        };
    }

    /**
     * Retorna inscripciones agrupadas por alumno.
     * Pagina por número de alumnos distintos (no por filas).
     *
     * @param {object} queryParams - Soporta los mismos filtros que findAll (payment_date, class_id, search, etc.)
     */
    async findGroupedByStudent(queryParams = {}) {
        const { page = 1, limit = 10, ...filters } = queryParams;
        const offset = (page - 1) * limit;

        // 1. Obtener los IDs de alumnos distintos que cumplen los filtros, paginados.
        //    Reutilizamos _buildQuery para aplicar todos los filtros (tenant, date_range, etc.)
        const baseQuery = this._buildQuery({ ...filters, isCount: false });

        const studentPage = await baseQuery
            .clone()
            .clearSelect()
            .distinct(
                "user_class.user_id",
                "u.first_name",
                "u.last_name",
                "pay.payment_method",
                "user_class.academy_id"
            )
            .orderBy("u.first_name", "asc")
            .limit(limit)
            .offset(offset);

        // Total de alumnos distintos — clearSelect() evita el error de GROUP BY en PostgreSQL
        const countResult = await baseQuery
            .clone()
            .clearSelect()
            .countDistinct("user_class.user_id as count")
            .first();

        const totalStudents = parseInt(countResult?.count || 0);

        if (studentPage.length === 0) {
            return {
                data: [],
                pagination: { total_students: 0, page: parseInt(page), limit: parseInt(limit) },
            };
        }

        const studentIds = studentPage.map((s) => s.user_id);

        // 2. Traer TODAS las clases inscritas para esos alumnos (dentro del mismo filtro de fecha si aplica).
        const allRegistrations = await this._buildQuery({ ...filters, isCount: false })
            .clearSelect()
            .whereIn("user_class.user_id", studentIds)
            .select(
                "user_class.id as registration_id",
                "user_class.user_id",
                "user_class.class_id",
                "user_class.academy_id",
                "u.first_name as user_first_name",
                "u.last_name as user_last_name",
                "pay.payment_method",
                "c.name as class_name",
                "c.hour as class_hour",
                "c.date as class_date",
                "c.level as class_level",
                "c.genre as class_genre"
            );

        // 3. Agrupar en memoria por user_id
        const studentMap = new Map();

        for (const row of allRegistrations) {
            if (!studentMap.has(row.user_id)) {
                studentMap.set(row.user_id, {
                    user_id: row.user_id,
                    first_name: row.user_first_name,
                    last_name: row.user_last_name,
                    payment_method: row.payment_method,
                    academy_id: row.academy_id,
                    classes: [],
                });
            }

            studentMap.get(row.user_id).classes.push({
                registration_id: row.registration_id,
                class_id: row.class_id,
                name: row.class_name,
                hour: row.class_hour,
                date: row.class_date,
                level: row.class_level,
                genre: row.class_genre,
            });
        }

        // Mantener el orden de paginación original (por first_name asc)
        const data = studentIds
            .map((id) => studentMap.get(id))
            .filter(Boolean);

        return {
            data,
            pagination: {
                total_students: totalStudents,
                page: parseInt(page),
                limit: parseInt(limit),
            },
        };
    }

    async havePlan(userId) {
        const result = await this._applyTenantFilter(this.knex("user_plan"), "user_plan")
            .join("users", "user_plan.user_id", "users.id")
            .where({ "users.id": userId })
            .select("user_plan.plan_id")
            .first();

        return !!result;
    }

    // Check if a class has reached the maximum number of students
    async maxUserPerClass(class_id) {
        const result = await this._applyTenantFilter(this.knex(this.tableName))
            .where({ class_id: class_id })
            .count("* as count")
            .first();

        const classes = await this._applyTenantFilter(this.knex("classes"), "classes")
            .select("classes.capacity")
            .where("classes.id", class_id)
            .first();

        return parseInt(result.count) >= parseInt(classes.capacity);
    }

    // Check if a user registered in max_classes
    async isRegisteredInMaxClasses(userId) {
        const result = await this._applyTenantFilter(this.knex(this.tableName))
            .where({ user_id: userId })
            .count("* as count")
            .first();

        const plan = await this._applyTenantFilter(this.knex("users"), "users")
            .join("user_plan", "users.id", "user_plan.user_id")
            .join("plans", "user_plan.plan_id", "plans.id")
            .where("users.id", userId)
            .first();

        // Tiene clase
        if (plan.max_classes == 0) {
            return false;
        }

        return parseInt(result.count) >= parseInt(plan.max_classes);
    }

    // Check if a user is already registered in a class
    async isRegistered(userId, classId) {
        const result = await this._applyTenantFilter(this.knex(this.tableName))
            .where({ user_id: userId, class_id: classId })
            .first();
        return !!result;
    }

    async isActive(userId) {
        const result = await this._applyTenantFilter(this.knex("users"), "users")
            .where({ id: userId })
            .select("plan_status", "first_name", "last_name")
            .first();
        const response = {
            plan_status: result.plan_status,
            name: `${result.first_name} ${result.last_name}`
        }
        return response;
    }
}

export { RegistrationModel };
export default new RegistrationModel();