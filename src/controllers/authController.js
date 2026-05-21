const bcrypt = require("bcrypt");
const { Usuario, Rol } = require("../models");

function mostrarLogin(req, res) {
  res.render("auth/login", {
    titulo: "Iniciar sesión",
    error: null,
  });
}

async function procesarLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("auth/login", {
        titulo: "Iniciar sesión",
        error: "Debe ingresar email y contraseña.",
      });
    }

    const usuario = await Usuario.findOne({
      where: {
        email,
        estado: "activo",
      },
      include: [
        {
          model: Rol,
          as: "rol",
          attributes: ["nombre"],
        },
      ],
    });

    if (!usuario) {
      return res.render("auth/login", {
        titulo: "Iniciar sesión",
        error: "El usuario no existe o se encuentra inactivo.",
      });
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.contrasenia_hash
    );

    if (!passwordValida) {
      return res.render("auth/login", {
        titulo: "Iniciar sesión",
        error: "La contraseña es incorrecta.",
      });
    }

    req.session.usuario = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol ? usuario.rol.nombre : "usuario",
    };

    res.redirect("/");
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).send("Error al iniciar sesión");
  }
}

function cerrarSesion(req, res) {
  req.session.destroy((error) => {
    if (error) {
      console.error("Error al cerrar sesión:", error);
      return res.status(500).send("Error al cerrar sesión");
    }

    res.redirect("/login");
  });
}

module.exports = {
  mostrarLogin,
  procesarLogin,
  cerrarSesion,
};