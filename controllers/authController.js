const knex = require("../db/knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CustomError = require("../utils/CustomError");

async function login(req, res, next) {
  const { email, password } = req.body;

  try {
    if (req.user) {
      throw new CustomError("You are already logged in", 401);
    }

    const user = await knex("users").where({ email }).first();

    if (!user) {
      throw new CustomError("Invalid email or password", 401, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new CustomError("Invalid password", 401, "Password mismatch");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.log(err);
    next(err); // Pasar el error al middleware de manejo de errores
  }
}

module.exports = { login };
