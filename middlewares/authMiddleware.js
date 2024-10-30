const jwt = require("jsonwebtoken");

// Middleware para autenticar el token JWT
function authenticateToken(req, res, next) {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];

  if (!token) return res.sendStatus(401); // Si no hay token, retornar no autorizado

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Si el token no es válido, retornar prohibido

    req.user = user; // Guardar la información del usuario en `req.user`
    next(); // Continuar con la solicitud
  });
}

module.exports = { authenticateToken };
