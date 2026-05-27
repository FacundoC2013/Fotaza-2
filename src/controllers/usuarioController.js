const { Usuario, Seguidor } = require("../models");

function obtenerRutaRetorno(req) {
  const volverA = req.body.volverA;

  if (
    typeof volverA === "string" &&
    volverA.startsWith("/") &&
    !volverA.startsWith("//")
  ) {
    return volverA;
  }

  return "/";
}

function agregarMensajeARuta(ruta, tipo, mensaje) {
  const separador = ruta.includes("?") ? "&" : "?";

  return `${ruta}${separador}${tipo}=${encodeURIComponent(mensaje)}`;
}

async function seguirUsuario(req, res) {
  try {
    const idSeguidor = Number(req.session.usuario.id_usuario);
    const idSeguido = Number(req.params.id);
    const volverA = obtenerRutaRetorno(req);

    if (!Number.isInteger(idSeguido) || idSeguido <= 0) {
      return res.status(400).send("ID de usuario inválido");
    }

    if (idSeguidor === idSeguido) {
      return res.redirect(
        agregarMensajeARuta(
          volverA,
          "error",
          "No podés seguirte a vos mismo."
        )
      );
    }

    const usuarioSeguido = await Usuario.findByPk(idSeguido, {
      attributes: ["id_usuario", "nombre", "apellido"],
    });

    if (!usuarioSeguido) {
      return res.status(404).send("Usuario no encontrado");
    }

    const [, seguimientoCreado] = await Seguidor.findOrCreate({
      where: {
        id_seguidor: idSeguidor,
        id_seguido: idSeguido,
      },
      defaults: {
        fecha_creacion: new Date(),
      },
    });

    if (!seguimientoCreado) {
      return res.redirect(
        agregarMensajeARuta(
          volverA,
          "error",
          "Ya seguis a este usuario."
        )
      );
    }

    return res.redirect(
      agregarMensajeARuta(
        volverA,
        "exito",
        `Ahora seguís a ${usuarioSeguido.nombre} ${usuarioSeguido.apellido}.`
      )
    );
  } catch (error) {
    console.error("Error al seguir usuario:", error);
    return res.status(500).send("Error al seguir al usuario");
  }
}

async function dejarDeSeguirUsuario(req, res) {
  try {
    const idSeguidor = Number(req.session.usuario.id_usuario);
    const idSeguido = Number(req.params.id);
    const volverA = obtenerRutaRetorno(req);

    if (!Number.isInteger(idSeguido) || idSeguido <= 0) {
      return res.status(400).send("ID de usuario inválido");
    }

    const usuarioSeguido = await Usuario.findByPk(idSeguido, {
      attributes: ["id_usuario", "nombre", "apellido"],
    });

    if (!usuarioSeguido) {
      return res.status(404).send("Usuario no encontrado");
    }

    const cantidadEliminada = await Seguidor.destroy({
      where: {
        id_seguidor: idSeguidor,
        id_seguido: idSeguido,
      },
    });

    if (cantidadEliminada === 0) {
      return res.redirect(
        agregarMensajeARuta(
          volverA,
          "error",
          "Todavía no seguís a este usuario."
        )
      );
    }

    return res.redirect(
      agregarMensajeARuta(
        volverA,
        "exito",
        `Dejaste de seguir a ${usuarioSeguido.nombre} ${usuarioSeguido.apellido}.`
      )
    );
  } catch (error) {
    console.error("Error al dejar de seguir usuario:", error);
    return res.status(500).send("Error al dejar de seguir al usuario");
  }
}
module.exports = {
  seguirUsuario,
  dejarDeSeguirUsuario,
};