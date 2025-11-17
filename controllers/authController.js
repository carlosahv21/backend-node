const knex = require("../db/knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const utilsCustomError = require("../utils/utilsCustomError");

// Función común para obtener usuario + rol + permisos + rutas + settings
async function getUserData(userId) {
  // Obtener usuario
  const user = await knex("users").where({ id: userId }).first();
  if (!user) throw new utilsCustomError("User not found", 404);

  // Obtener rol del usuario
  const userRoleRecord = await knex("user_roles").where({ user_id: user.id }).first();
  if (!userRoleRecord) throw new utilsCustomError("User has no role assigned", 403);

  const userRole = await knex("roles").where({ id: userRoleRecord.role_id }).first();

  // Permisos del rol
  const rolePermissions = await knex("role_permissions")
    .where({ role_id: userRole.id })
    .pluck("permission_id");

  // Rutas permitidas
  const permittedRouteIds = await knex("permissions")
    .whereIn("id", rolePermissions)
    .pluck("route_id");

  const routes = await knex("routes")
    .whereIn("id", permittedRouteIds)
    .andWhere("is_active", 1)
    .orderBy("order");

  // Construir árbol de rutas
  const buildRouteTree = (flatRoutes) => {
    const map = {};
    const tree = [];
    flatRoutes.forEach(r => { map[r.id] = { ...r, children: [] }; });
    flatRoutes.forEach(r => {
      if (r.parent_id && map[r.parent_id]) map[r.parent_id].children.push(map[r.id]);
      else if (!r.parent_id) tree.push(map[r.id]);
    });
    return tree;
  };
  const routesTree = buildRouteTree(routes);

  // Configuración de la academia
  const settings = await knex("settings").first();

  return {
    user: {
      id: user.id,
      email: user.email,
      role: userRole.name,
    },
    routes: routesTree,
    settings
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
