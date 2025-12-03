// models/classModel.js
import BaseModel from './baseModel.js';

class ClassModel extends BaseModel {
    constructor() {
        super('classes');

        this.joins = [];
        this.selectFields = ['classes.*'];
        this.searchFields = ['classes.name', 'classes.level', 'classes.genre', 'classes.date'];

        this.validations = [
            { name: "timeConflict", config: {} },
        ];
    }

    // --- Lógica de Obtención de Datos ---

    async findByIdDetails(id) {
        const apiData = await this._getClassData(id);

        return this._transformToViewModel(apiData);
    }

    async _getClassData(id) {
        const record = await super.findById(id);

        if (!record) return null;

        const teacherData = await this.knex('users')
            .where('id', record.teacher_id)
            .select(
                'first_name as teacher_first_name',
                'last_name as teacher_last_name'
            )
            .first();

        return {
            ...record,
            ...teacherData
        };
    }

    // --- Lógica de Transformación a View Model ---

    async _transformToViewModel(apiData) {
        if (!apiData) return {};

        const formatValue = (key, value) => {
            if (value === null || value === undefined || value === '') return "-";

            if (key.includes("favorites")) {
                return (value === 1) ? "Sí" : "No";
            }

            if (key === 'duration' && !isNaN(parseInt(value))) {
                return `${value} min`;
            }

            if (key.includes("date") || key.includes("at")) {
                return value;
            }
            return value;
        };

        const teacherFullName = apiData.teacher_first_name
            ? `${apiData.teacher_first_name} ${apiData.teacher_last_name}`
            : 'Profesor(a) no asignado';

        return {
            title: apiData.name,
            subtitle: `${apiData.genre} (${apiData.level})`,
            email: apiData.description,

            sections: [
                {
                    label: "Información General",
                    items: [
                        { name: "Profesor", value: teacherFullName },
                        { name: "Nivel", value: apiData.level },
                        { name: "Género", value: apiData.genre },
                        { name: "Duración", value: formatValue('duration', apiData.duration) },
                        { name: "Capacidad", value: apiData.capacity },
                    ],
                },
                {
                    label: "Horario y Disponibilidad",
                    items: [
                        { name: "Día", value: apiData.date },
                        { name: "Hora", value: apiData.hour },
                        {
                            name: "Favorita",
                            value: formatValue('is_favorites', apiData.is_favorites),
                            renderer: 'booleanTag'
                        },
                    ],
                },
                {
                    label: "Registro de Tiempos",
                    items: [
                        { name: "Creado En", value: apiData.created_at },
                        { name: "Actualizado En", value: apiData.updated_at },
                    ],
                },
            ],
        };
    }
}

export default new ClassModel();