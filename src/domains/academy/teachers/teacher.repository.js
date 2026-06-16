import BaseModel from "../../../shared/models/baseModel.js";
import bcrypt from 'bcryptjs';

function generateTempPassword() {
    const words = ['Bienvenido', 'Usuario', 'Acceso', 'Portal', 'Academia'];
    const word = words[Math.floor(Math.random() * words.length)];
    const year = new Date().getFullYear();
    const symbol = ['!', '@', '#', '$'][Math.floor(Math.random() * 4)];
    return `${word}${year}${symbol}`;
}

class TeacherRepository extends BaseModel {
    constructor() {
        super('users');

        this.joins = [
            { table: "roles", alias: "r", on: ["users.role_id", "r.id"] }
        ];

        this.selectFields = ["users.*", "r.name as role_name"];
        this.searchFields = ["users.first_name", "users.last_name", "users.email", "r.name"];

        this.filterMapping = {
            'role': 'r.name',
            'role_name': 'r.name'
        };
    }

    async findRoleByName(roleName) {
        return this.knex('roles').where({ name: roleName }).first();
    }

    async create(data) {
        const { role, ...user } = data;

        let tempPassword = null;

        if (role) {
            const roleRecord = await this.findRoleByName(role);
            if (roleRecord) {
                user.role_id = roleRecord.id;
            }
        }

        if (!user.password) {
            tempPassword = generateTempPassword();
            user.password = await bcrypt.hash(tempPassword, 10);
        }

        const result = await super.create(user);
        if (tempPassword) {
            result.temp_password = tempPassword;
        }
        return result;
    }

    async update(id, data) {
        const { role, ...user } = data;

        if (role) {
            const roleRecord = await this.findRoleByName(role);
            if (roleRecord) {
                user.role_id = roleRecord.id;
            }
        }

        return super.update(id, user);
    }

    async findByIdDetails(id) {
        const db = this.knex;

        const teacher = await this._applyTenantFilter(db('users as u'), 'u')
            .leftJoin('roles as r', 'u.role_id', 'r.id')
            .where('u.id', id)
            .select('u.id', 'u.first_name', 'u.last_name', 'u.email', 'u.email_verified', 'r.name as role_name')
            .first();

        if (!teacher) return null;

        const [stats, classes, payments] = await Promise.all([
            this._getTeacherStats(id),
            this._applyTenantFilter(db('classes'), 'classes')
                .where('teacher_id', id)
                .select('id', 'name', 'date', 'hour', 'duration', 'genre')
                .orderBy('date', 'asc')
                .limit(5),
            this._getPaymentSummary(id)
        ]);

        return this._transformToDetailedModel(teacher, stats, classes, payments);
    }

    async _getTeacherStats(id) {
        const db = this.knex;
        const classesCount = await this._applyTenantFilter(db('classes'), 'classes').where('teacher_id', id).count('id as total');
        const studentsCount = await this._applyTenantFilter(db('user_class as uc'), 'uc')
            .join('classes as c', 'uc.class_id', 'c.id')
            .where('c.teacher_id', id)
            .countDistinct('uc.user_id as total');

        return {
            classes: classesCount[0].total || 0,
            rating: 4.9,
            students: studentsCount[0].total || 0
        };
    }

    async _getPaymentSummary(id) {
        const db = this.knex;
        const currentMonth = new Date().getMonth() + 1;

        const paidThisMonth = await this._applyTenantFilter(db('payments'), 'payments')
            .where('user_id', id)
            .andWhereRaw('EXTRACT(MONTH FROM payment_date) = ?', [currentMonth])
            .sum('amount as total');

        return {
            to_pay: 420.00,
            paid_current_month: parseFloat(paidThisMonth[0].total || 0),
            next_cutoff: '2026-10-30'
        };
    }

    _transformToDetailedModel(teacher, stats, classes, payments) {
        return {
            header: {
                ...teacher,
                full_name: `${teacher.first_name} ${teacher.last_name}`,
                role_label: teacher.role_name,
                role: teacher.role_name
            },
            stats: {
                classes_count: stats.classes,
                rating: stats.rating,
                students_count: stats.students
            },
            payment_summary: {
                pending_amount: payments.to_pay,
                paid_amount: payments.paid_current_month,
                next_cutoff_date: payments.next_cutoff
            },
            weekly_classes: classes.map(c => ({
                id: c.id,
                name: c.name,
                genre: c.genre,
                schedule: `${c.date} • ${c.hour}`,
                duration: `${c.duration} min`,
                location: "Sala A"
            }))
        };
    }
}

export default new TeacherRepository();