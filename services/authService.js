// services/authService.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authModel from '../models/authModel.js';
import utilsCustomError from "../utils/utilsCustomError.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1h";

/**
 * Construye el árbol de rutas jerárquico a partir de rutas planas.
 */
const buildRouteTree = (flatRoutes) => {
    const map = {};
    const tree = [];
    
    flatRoutes.forEach(r => {
        
        map[r.id] = {
            id: r.id,
            name: r.name,
            label: r.label,
            path: r.path,
            full_path: r.full_path,
            parent_id: r.parent_id,
            icon: r.icon,
            order: r.order,
            is_menu: r.is_menu,
            children: []
        };
    });


    flatRoutes.forEach(r => {
        if (r.parent_id && map[r.parent_id]) {
            map[r.parent_id].children.push(map[r.id]);
        } else if (!r.parent_id) {
            tree.push(map[r.id]);
        }
    });

    tree.sort((a, b) => a.order - b.order);

    return tree;
};


/**
 * Función común para obtener usuario + rol + permisos + rutas + settings
 */
const getUserData = async (userId) => {

    const userRecord = await authModel.knex("users").where({ id: userId }).first();
    if (!userRecord) throw new utilsCustomError("User not found", 404);

    const roleData = await authModel.findRoleByUserId(userId);

    const rawPermissionsAndRoutes = await authModel.findPermissionsAndRoutes(roleData.role_id);

    const permissionsList = [...new Set(rawPermissionsAndRoutes.map(p =>
        `${p.name}:${p.action}`
    ))];

    const uniqueRoutes = rawPermissionsAndRoutes
        .filter((route, index, self) => index === self.findIndex(r => r.id === route.id));

    const routesTree = buildRouteTree(uniqueRoutes);

    const settings = await authModel.findSettings();

    return {
        user: {
            id: userRecord.id,
            email: userRecord.email,
            role: roleData.role_name,
        },
        routes: routesTree,
        settings,
        permissions: permissionsList,
    };
};

/**
 * 3. Lógica de negocio de Login (hashing y JWT)
 */
const authenticateUser = async ({ email, password }) => {
    const user = await authModel.findUserByEmail(email);
    if (!user) {
        throw new utilsCustomError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new utilsCustomError("Invalid email or password", 401);
    }

    const data = await getUserData(user.id);

    const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return { token, ...data };
};

/**
 * Refrescar datos de usuario
 */
const getAuthenticatedUser = async (userId) => {
    return getUserData(userId);
};


export default {
    authenticateUser,
    getAuthenticatedUser,
};