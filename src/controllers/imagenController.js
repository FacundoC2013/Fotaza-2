const { Imagen, Comentario, Valoracion, Publicacion } = require("../models");
const path = require("path");

// Conserva las URLs existentes, pero autoriza cada entrega antes de leer el archivo.
async function servirArchivoImagen(req, res) {
  res.set("Cache-Control", "private, no-store");
  res.set("X-Content-Type-Options", "nosniff");
  res.vary("Cookie");

  if (req.method !== "GET" && req.method !== "HEAD") {
    return res.status(405).set("Allow", "GET, HEAD").send("Método no permitido");
  }

  let ruta;
  try {
    ruta = decodeURIComponent(req.path);
  } catch {
    return res.status(400).send("Ruta inválida");
  }

  // Solo archivos de imagen en la carpeta de uploads o su subcarpeta seed.
  if (!/^\/(?:seed\/)?[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)$/i.test(ruta)) {
    return res.status(404).send("Imagen no encontrada");
  }

  try {
    const imagen = await Imagen.findOne({
      where: { ruta_archivo: `/uploads/imagenes${ruta}` },
      include: [{ model: Publicacion, as: "publicacion" }],
    });

    if (!imagen || !imagen.publicacion || imagen.publicacion.estado === "bajada") {
      return res.status(404).send("Imagen no encontrada");
    }
    if (imagen.licencia !== "sin_copyright" &&
        (imagen.licencia !== "con_copyright" || !req.session.usuario)) {
      return res.status(403).send("Acceso no permitido");
    }

    return res.sendFile(ruta.slice(1), {
      root: path.join(__dirname, "../public/uploads/imagenes"),
      dotfiles: "deny",
      cacheControl: false,
      lastModified: false,
      acceptRanges: false,
    }, (error) => {
      if (error && !res.headersSent) {
        res.status(error.statusCode === 404 ? 404 : 500).send("Imagen no disponible");
      }
    });
  } catch (error) {
    console.error("Error al entregar imagen:", error);
    return res.status(500).send("Error al cargar imagen");
  }
}

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

    const imagen = await Imagen.findByPk(idImagen, {
      include: [{ model: Publicacion, as: "publicacion" }],
    });

    if (!imagen || !imagen.publicacion || imagen.publicacion.estado === "bajada") {
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
          attributes: ["id_publicacion", "id_usuario", "estado"],
        },
      ],
    });

    if (!imagen || !imagen.publicacion || imagen.publicacion.estado === "bajada") {
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

async function cambiarEstadoComentarios(req, res) {
  try {
    const idImagen = Number(req.params.id);
    const idUsuario = Number(req.session.usuario.id_usuario);

    if (!idImagen) {
      return res.status(400).send("ID de imagen inválido");
    }

    const imagen = await Imagen.findByPk(idImagen, {
      include: [
        {
          model: Publicacion,
          as: "publicacion",
          attributes: ["id_publicacion", "id_usuario", "estado"],
        },
      ],
    });

    if (!imagen || !imagen.publicacion || imagen.publicacion.estado === "bajada") {
      return res.status(404).send("Imagen no encontrada");
    }

    if (Number(imagen.publicacion.id_usuario) !== idUsuario) {
      return res.redirect(
        `/publicaciones/${imagen.id_publicacion}?error=${encodeURIComponent(
          "Solo el autor puede cambiar el estado de los comentarios."
        )}`
      );
    }

    imagen.comentarios_abiertos = !imagen.comentarios_abiertos;
    await imagen.save();

    const mensaje = imagen.comentarios_abiertos
      ? "Comentarios abiertos correctamente."
      : "Comentarios cerrados correctamente.";

    return res.redirect(
      `/publicaciones/${imagen.id_publicacion}?exito=${encodeURIComponent(
        mensaje
      )}`
    );
  } catch (error) {
    console.error("Error al cambiar estado de comentarios:", error);
    return res.status(500).send("Error al cambiar el estado de comentarios");
  }
}

module.exports = {
  servirArchivoImagen,
  comentarImagen,
  valorarImagen,
  cambiarEstadoComentarios,
};
