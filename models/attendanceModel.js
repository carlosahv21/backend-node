import BaseModel from './baseModel.js';

class AttendanceModel extends BaseModel {
    constructor() {
        super('attendance');

        this.joins = [
            { table: "classes", alias: "c", on: ["attendance.class_id", "c.id"] },
            { table: "users", alias: "u", on: ["attendance.student_id", "u.id"] }
        ];

        this.selectFields = [
            "attendance.*",
            "c.name as class_name",
            "c.date as class_date",
            "u.first_name as student_first_name",
            "u.last_name as student_last_name",
            "u.email as student_email"
        ];

        this.searchFields = ["c.name", "u.first_name", "u.last_name"];

        this.filterMapping = {
            'class_id': 'attendance.class_id',
            'student_id': 'attendance.student_id',
            'date': 'attendance.date',
            'status': 'attendance.status'
        };

        this.relationMaps = {
            'default': {
                joins: this.joins,
                column_map: this.filterMapping
            }
        };
    }

    async findByClassAndDate(class_id, date) {
        return this.knex(this.tableName)
            .where({ class_id: class_id, date: date })
            .select('*');
    }

    async bulkCreateOrUpdate(attendanceRecords) {

        return this.knex(this.tableName)
            .insert(attendanceRecords)
            .onConflict(['class_id', 'student_id', 'date'])
            .merge(['status', 'updated_at']);
    }
}

export default new AttendanceModel();
