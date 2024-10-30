const knex = require("../db/knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Controlador para manejar el login
async function login(req, res) {
  const { email, password } = req.body;
  
  try {
    // no permitir que se logee 2 veces
    if (req.user) {
      return res.status(401).json({ message: "You are already logged in" });
    }

    // Buscar el usuario en la base de datos
    const user = await knex("users").where({ email }).first();

    // Verificar si el usuario existe
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Comparar la contraseña proporcionada con la almacenada (hashed)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generar un token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET, // Clave secreta para firmar el token
      { expiresIn: "1h" } // El token expirará en 1 hora
    );

    // Enviar el token y el usuario autenticado como respuesta
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { login };
