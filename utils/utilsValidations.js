export const validationHandlers = {
    /**
     * Valida que el campo sea único dentro del mismo tenant (academy_id).
     * @param {object} knex
     * @param {string} table
     * @param {object} data
     * @param {object} config - { field: string }
     * @param {string|null} tenantId - academy_id del contexto actual
     */
    uniqueField: async (knex, table, data, config, tenantId) => {
        const { field } = config;
        if (!data[field]) return null;

        let query = knex(table).where(field, data[field]);

        // Excluir el propio registro en actualizaciones
        if (data.id) query = query.andWhereNot("id", data.id);

        // Aislar la validación al tenant actual para no bloquear entre academias
        if (tenantId) query = query.andWhere("academy_id", tenantId);

        const exists = await query.first();
        if (exists) {
            return `Ya existe un registro con el mismo valor en "${field}".`;
        }

        return null;
    },

    timeConflict: async (knex, table, data, config) => {
        const { date, hour, duration, id } = data;

        if (!date || !hour || !duration) return null;

        // Parseamos la hora "HH:mm"
        const [h, m] = hour.split(":").map(Number);
        const startTime = h * 60 + m;
        const endTime = startTime + parseInt(duration);

        const query = knex(table).where({ date });
        if (id) query.andWhereNot("id", id);

        const existingClasses = await query;

        const overlap = existingClasses.find((cls) => {
            const [clsStartH, clsStartM] = cls.hour.split(":").map(Number);
            const clsStart = clsStartH * 60 + clsStartM;
            const clsEnd = clsStart + parseInt(cls.duration, 10);

            return (
                (startTime >= clsStart && startTime < clsEnd) ||
                (endTime > clsStart && endTime <= clsEnd) ||
                (startTime <= clsStart && endTime >= clsEnd)
            );
        });

        if (overlap) {
            const [clsStartH, clsStartM] = overlap.hour.split(":").map(Number);
            const totalStart = clsStartH * 60 + clsStartM;
            const totalEnd = totalStart + parseInt(overlap.duration, 10);
            const clsEndH = Math.floor(totalEnd / 60) % 24;
            const clsEndM = totalEnd % 60;

            const formatTime = (h, m) =>
                `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

            const conflict = `${overlap.hour} - ${formatTime(clsEndH, clsEndM)}`;
            return `Conflicto de horario: ya existe una clase ese día entre ${conflict}.`;
        }

        return null;
    },
};