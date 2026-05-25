const { Imagen, Comentario } = require("../models");

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

module.exports = {
  comentarImagen,
};