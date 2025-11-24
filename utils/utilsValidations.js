export const validationHandlers = {
    uniqueField: async (knex, table, data, config) => {
        const { field } = config;
        if (!data[field]) return null;

        const exists = await knex(table).where(field, data[field]).first();
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

        const overlap = existingClasses.find(cls => {
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
            const clsEndH = Math.floor((clsStartH * 60 + clsStartM + parseInt(overlap.duration, 10)) / 60) % 24;
            const clsEndM = (clsStartH * 60 + clsStartM + parseInt(overlap.duration, 10)) % 60;

            const formatTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

            const conflict = `${overlap.hour} - ${formatTime(clsEndH, clsEndM)}`;
            return `Conflicto de horario: ya existe una clase ese día entre ${conflict}.`;
        }

        return null;
    }

};

function _formatEndTime(start, duration) {
    const [h, m] = start.split(":").map(Number);
    const end = h * 60 + m + parseInt(duration);
    const endH = Math.floor(end / 60) % 24;
    const endM = end % 60;
    return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
}