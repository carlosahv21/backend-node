const knex = require("../db/knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const utilsCustomError = require("../utils/utilsCustomError");

// Función común para obtener usuario + rol + permisos + rutas + settings
async function getUserData(userId) {
    // === 1. Obtener usuario y rol ===
    const userRecord = await knex("users").where({ id: userId }).first();
    if (!userRecord) throw new utilsCustomError("User not found", 404);

    // Hacemos una única consulta para obtener el rol y los datos de la academia
    const roleData = await knex("user_roles")
        .join("roles", "user_roles.role_id", "roles.id")
        .where("user_roles.user_id", userId)
        .select("roles.id as role_id", "roles.name as role_name")
        .first();

    if (!roleData) throw new utilsCustomError("User has no role assigned", 403);

    // === 2. Obtener Permisos y Rutas con UNA SOLA consulta JOIN ===
    const rawPermissionsAndRoutes = await knex("role_permissions")
        .join("permissions", "role_permissions.permission_id", "permissions.id")
        .join("routes", "permissions.route_id", "routes.id")
        .where("role_permissions.role_id", roleData.role_id)
        .andWhere("routes.is_active", 1)
        .orderBy("routes.order")
        .select(
            "permissions.name as action",
            "routes.*" // Trae todos los campos de routes (id, name, parent_id, etc.)
        );
        
    // === 3. Procesamiento en JavaScript ===

    // 3a. Generar el array plano de permisos para el Frontend: ['classes:view', 'students:create']
    const permissionsList = [...new Set(rawPermissionsAndRoutes.map(p => 
        `${p.name}:${p.action}` // Usamos routes.name y permissions.name (action)
    ))];
    
    // 3b. Filtrar rutas únicas y obtener solo las rutas permitidas (las necesitamos para el Sidebar)
    const uniqueRouteIds = [...new Set(rawPermissionsAndRoutes.map(r => r.id))];
    
    const uniqueRoutes = rawPermissionsAndRoutes
        .filter((route, index, self) => index === self.findIndex(r => r.id === route.id))
        .filter(route => uniqueRouteIds.includes(route.id));

    // 3c. Construir árbol de rutas (tu función original)
    const buildRouteTree = (flatRoutes) => {
        // ... [Mantener tu lógica original de buildRouteTree aquí] ...
        // Ya que la tienes definida arriba, simplemente asegúrate de que esté accesible aquí.
        const map = {};
        const tree = [];
        flatRoutes.forEach(r => { map[r.id] = { ...r, children: [] }; });
        flatRoutes.forEach(r => {
            if (r.parent_id && map[r.parent_id]) map[r.parent_id].children.push(map[r.id]);
            else if (!r.parent_id) tree.push(map[r.id]);
        });
        return tree;
    };
    const routesTree = buildRouteTree(uniqueRoutes);

    // 4. Configuración de la academia (Se mantiene como estaba, es otra tabla)
    const settings = await knex("settings").first(); // 1 consulta extra

    return {
        user: {
            id: userRecord.id,
            email: userRecord.email,
            role: roleData.role_name,
        },
        routes: routesTree,
        settings,
        // ESTO ES CLAVE: Permisos fáciles de validar en el frontend
        permissions: permissionsList, 
    };
}

// Login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await knex("users").where({ email }).first();
    if (!user) throw new utilsCustomError("Invalid email or password", 401);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new utilsCustomError("Invalid password", 401);

    const data = await getUserData(user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, ...data });
  } catch (err) {
    console.error(err);
    next(err);
  }
}

// Ruta /me
async function me(req, res, next) {
  try {
    const userId = req.user.id; // viene del token
    const data = await getUserData(userId);
    res.json(data);
  } catch (err) {
    console.error(err);
    next(err);
  }
}

module.exports = { login, me };
