const { Imagen, Comentario, Valoracion, Publicacion } = require("../models");

async function comentarImagen(req, res) {
  try {
    const idImagen = Number(req.params.id);
    const idUsuario = req.session.usuario.id_usuario;
    const texto = req.body.texto ? req.body.texto.trim() : "";

    if (!idImagen) {
      return res.status(400).send("ID de imagen inválido");
    }

    if (!texto) {
      return res.status(400).send("El comentario no puede estar vacío");
    }

    const imagen = await Imagen.findByPk(idImagen);

    if (!imagen) {
      return res.status(404).send("Imagen no encontrada");
    }

    if (!imagen.comentarios_abiertos) {
      return res.status(403).send("Los comentarios de esta imagen están cerrados");
    }

    await Comentario.create({
      id_usuario: idUsuario,
      id_imagen: idImagen,
      texto,
      estado: "activo",
      fecha_creacion: new Date(),
    });

    res.redirect(`/publicaciones/${imagen.id_publicacion}`);
  } catch (error) {
    console.error("Error al comentar imagen:", error);
    res.status(500).send("Error al guardar el comentario");
  }
}

async function valorarImagen(req, res) {
  try {
    const idImagen = Number(req.params.id);
    const idUsuario = req.session.usuario.id_usuario;
    const puntaje = Number(req.body.puntaje);

    if (!idImagen) {
      return res.status(400).send("ID de imagen inválido");
    }

    if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
      return res.status(400).send("El puntaje debe ser un número entre 1 y 5");
    }

    const imagen = await Imagen.findByPk(idImagen, {
      include: [
        {
          model: Publicacion,
          as: "publicacion",
          attributes: ["id_publicacion", "id_usuario"],
        },
      ],
    });

    if (!imagen) {
      return res.status(404).send("Imagen no encontrada");
    }

    if (Number(imagen.publicacion.id_usuario) === Number(idUsuario)) {
      return res.redirect(
        `/publicaciones/${imagen.id_publicacion}?error=${encodeURIComponent(
          "No podés valorar una imagen de tu propia publicación."
        )}`
      );
    }

    const valoracionExistente = await Valoracion.findOne({
      where: {
        id_usuario: idUsuario,
        id_imagen: idImagen,
      },
    });

    if (valoracionExistente) {
      return res.redirect(
        `/publicaciones/${imagen.id_publicacion}?error=${encodeURIComponent(
          "Ya valoraste esta imagen anteriormente."
        )}`
      );
    }

    await Valoracion.create({
      id_usuario: idUsuario,
      id_imagen: idImagen,
      puntaje,
      fecha_creacion: new Date(),
    });

    res.redirect(
      `/publicaciones/${imagen.id_publicacion}?exito=${encodeURIComponent(
        "Valoracion registrada correctamente."
      )}`
    );
  } catch (error) {
    console.error("Error al valorar imagen:", error);
    res.status(500).send("Error al guardar la valoracion");
  }
}

module.exports = {
  comentarImagen,
  valorarImagen,
};