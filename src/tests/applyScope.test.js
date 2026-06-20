import { describe, it, expect, vi } from 'vitest';
import { applyScope } from '../shared/utils/applyScope.js';

// Mock mínimo de un Knex query builder: registra los where aplicados.
function makeQueryMock() {
    const calls = [];
    return {
        calls,
        where: vi.fn((...args) => { calls.push(['where', ...args]); }),
        whereIn: vi.fn((...args) => { calls.push(['whereIn', ...args]); }),
    };
}

describe('applyScope', () => {
    it('lanza error si no hay scope definido', async () => {
        const query = makeQueryMock();
        await expect(applyScope(query, null, { id: 1 }, {}))
            .rejects.toThrow('Permiso o scope no definido');
    });

    it("scope 'all' no aplica ninguna restricción", async () => {
        const query = makeQueryMock();
        await applyScope(query, { scope: 'all' }, { id: 1 }, {});
        expect(query.calls).toHaveLength(0);
    });

    it("scope 'own' restringe por la columna propia al user.id", async () => {
        const query = makeQueryMock();
        await applyScope(query, { scope: 'own' }, { id: 'user-42' }, { ownColumn: 'created_by' });
        expect(query.where).toHaveBeenCalledWith('created_by', 'user-42');
    });

    it("scope 'own' falla si falta ownColumn", async () => {
        const query = makeQueryMock();
        await expect(applyScope(query, { scope: 'own' }, { id: 1 }, {}))
            .rejects.toThrow('ownColumn faltante');
    });

    it("scope 'assigned' usa el resolver para limitar por whereIn", async () => {
        const query = makeQueryMock();
        const config = {
            assignedColumn: 'class_id',
            assignedResolver: vi.fn(async () => ['c1', 'c2']),
        };
        await applyScope(query, { scope: 'assigned' }, { id: 'teacher-1' }, config);
        expect(config.assignedResolver).toHaveBeenCalledWith({ id: 'teacher-1' });
        expect(query.whereIn).toHaveBeenCalledWith('class_id', ['c1', 'c2']);
    });

    it("scope 'assigned' falla si falta configuración", async () => {
        const query = makeQueryMock();
        await expect(applyScope(query, { scope: 'assigned' }, { id: 1 }, {}))
            .rejects.toThrow('assignedColumn/assignedResolver faltante');
    });
});
