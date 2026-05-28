const { Usuario, Seguidor, Publicacion, Imagen } = require("../models");

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
async function verPerfil(req, res) {
  try {
    const idPerfil = Number(req.params.id);

    const idUsuarioActual = req.session?.usuario?.id_usuario
      ? Number(req.session.usuario.id_usuario)
      : null;

    if (!Number.isInteger(idPerfil) || idPerfil <= 0) {
      return res.status(400).send("ID de usuario inválido");
    }

    const usuarioDB = await Usuario.findByPk(idPerfil, {
      attributes: [
        "id_usuario",
        "nombre",
        "apellido",
        "biografia",
        "fecha_registro",
      ],
      include: [
        {
          model: Publicacion,
          as: "publicaciones",
          where: {
            estado: "activa",
          },
          required: false,
          attributes: [
            "id_publicacion",
            "titulo",
            "descripcion",
            "fecha_creacion",
          ],
          include: [
            {
              model: Imagen,
              as: "imagenes",
              attributes: [
                "id_imagen",
                "titulo",
                "ruta_archivo",
                "licencia",
              ],
              required: false,
            },
          ],
        },
      ],
    });

    if (!usuarioDB) {
      return res.status(404).send("Usuario no encontrado");
    }

    const perfil = usuarioDB.get({ plain: true });

    perfil.publicaciones.sort(
      (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
    );

    const cantidadSeguidores = await Seguidor.count({
      where: {
        id_seguido: idPerfil,
      },
    });

    const cantidadSeguidos = await Seguidor.count({
      where: {
        id_seguidor: idPerfil,
      },
    });

    const esPerfilPropio =
      idUsuarioActual !== null && idUsuarioActual === idPerfil;

    let siguePerfil = false;

    if (idUsuarioActual && !esPerfilPropio) {
      const seguimiento = await Seguidor.findOne({
        where: {
          id_seguidor: idUsuarioActual,
          id_seguido: idPerfil,
        },
      });

      siguePerfil = Boolean(seguimiento);
    }

    res.render("usuarios/perfil", {
      titulo: `${perfil.nombre} ${perfil.apellido}`,
      perfil,
      cantidadSeguidores,
      cantidadSeguidos,
      esPerfilPropio,
      siguePerfil,
      error: req.query.error || null,
      exito: req.query.exito || null,
    });
  } catch (error) {
    console.error("Error al cargar el perfil:", error);
    res.status(500).send("Error al cargar el perfil del usuario");
  }
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
  verPerfil,
  seguirUsuario,
  dejarDeSeguirUsuario,
};