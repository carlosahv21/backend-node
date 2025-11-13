// db/seeds/blocksData.js
const knex = require('../knex');

async function getBlocksData() {
    const [classModule] = await knex('modules')
        .where('name', 'Class')
        .select('id');

    const [settingsModule] = await knex('modules')
        .where('name', 'Settings')
        .select('id');

    const [usersModule] = await knex('modules')
        .where('name', 'Users')
        .select('id');

    const blocksData = [
        // Bloques Clases
        {
            name: "Basic Information",
            description: "Basic information block",
            order: 1,
            module_id: classModule.id,
            collapsible: true,
            display_mode: "edit",
        },
        {
            name: "Class Details",
            description: "Class details block",
            order: 2,
            module_id: classModule.id,
            collapsible: true,
            display_mode: "edit",
        },
        {
            name: "Schedule",
            description: "Schedule block",
            order: 3,
            module_id: classModule.id,
            collapsible: false,
            display_mode: "edit",
        },

        // Bloques Settings
        {
            name: "General Information",
            description: "General Information block",
            order: 1,
            module_id: settingsModule.id,
            collapsible: true,
            display_mode: "edit",
        },

        // Bloques Users
        {
            name: "Basic Information",
            description: "Basic user information",
            order: 1,
            module_id: usersModule.id,
            collapsible: true,
            display_mode: "edit",
        }
    ];
    
    return blocksData;
}

module.exports = { getBlocksData };
