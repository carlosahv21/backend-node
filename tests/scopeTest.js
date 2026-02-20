import { applyScope } from '../utils/applyScope.js';

// Mock Knex Query Builder
const createMockQuery = () => {
    const query = {
        sql: [],
        bindings: [],
        where(column, value) {
            this.sql.push(`WHERE ${column} = ?`);
            this.bindings.push(value);
            return this;
        },
        whereIn(column, values) {
            this.sql.push(`WHERE ${column} IN (${values.join(',')})`);
            return this;
        }
    };
    return query;
};

// Mock User
const user = { id: 123 };

// Mock Config
const config = {
    ownColumn: 'table.user_id',
    assignedColumn: 'table.class_id',
    assignedResolver: async (u) => [101, 102, 103]
};

async function runTests() {
    console.log('--- Testing applyScope ---');

    // Test 1: Scope 'all'
    try {
        const q1 = createMockQuery();
        await applyScope(q1, { scope: 'all' }, user, config);
        if (q1.sql.length === 0) console.log('✅ Test 1 Passed: Scope all (no changes)');
        else console.error('❌ Test 1 Failed:', q1.sql);
    } catch (e) { console.error('❌ Test 1 Error:', e); }

    // Test 2: Scope 'own'
    try {
        const q2 = createMockQuery();
        await applyScope(q2, { scope: 'own' }, user, config);
        if (q2.sql[0] === 'WHERE table.user_id = ?' && q2.bindings[0] === 123) {
            console.log('✅ Test 2 Passed: Scope own');
        } else {
            console.error('❌ Test 2 Failed:', q2.sql);
        }
    } catch (e) { console.error('❌ Test 2 Error:', e); }

    // Test 3: Scope 'assigned'
    try {
        const q3 = createMockQuery();
        await applyScope(q3, { scope: 'assigned' }, user, config);
        if (q3.sql[0] === 'WHERE table.class_id IN (101,102,103)') {
            console.log('✅ Test 3 Passed: Scope assigned');
        } else {
            console.error('❌ Test 3 Failed:', q3.sql);
        }
    } catch (e) { console.error('❌ Test 3 Error:', e); }

    // Test 4: Missing Permission
    try {
        await applyScope(createMockQuery(), null, user, config);
        console.error('❌ Test 4 Failed: Should have thrown error');
    } catch (e) {
        if (e.message.includes('Permiso o scope no definido')) console.log('✅ Test 4 Passed: Missing permission check');
        else console.error('❌ Test 4 Failed with wrong error:', e.message);
    }

    // Test 5: Missing Config for 'own'
    try {
        await applyScope(createMockQuery(), { scope: 'own' }, user, {});
        console.error('❌ Test 5 Failed: Should have thrown error');
    } catch (e) {
        if (e.message.includes('Configuración ownColumn faltante')) console.log('✅ Test 5 Passed: Missing config check');
        else console.error('❌ Test 5 Failed with wrong error:', e.message);
    }
}

runTests();
