const { Publicacion, Imagen, Usuario, Etiqueta } = require("../models");

async function verDetallePublicacion(req, res) {
  try {
    const idPublicacion = Number(req.params.id);

    if (!idPublicacion) {
      return res.status(400).send("ID de publicación inválido");
    }

    const publicacionDB = await Publicacion.findByPk(idPublicacion, {
      include: [
        {
          model: Usuario,
          as: "autor",
          attributes: ["id_usuario", "nombre", "apellido", "email"],
        },
        {
          model: Imagen,
          as: "imagenes",
          attributes: [
            "id_imagen",
            "titulo",
            "descripcion",
            "ruta_archivo",
            "licencia",
            "marca_agua",
            "texto_marca_agua",
            "comentarios_abiertos",
          ],
        },
        {
          model: Etiqueta,
          as: "etiquetas",
          attributes: ["id_etiqueta", "nombre"],
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!publicacionDB) {
      return res.status(404).send("Publicación no encontrada");
    }

    const publicacion = publicacionDB.get({ plain: true });

    res.render("publicaciones/detalle", {
      titulo: publicacion.titulo,
      publicacion,
    });
  } catch (error) {
    console.error("Error al ver detalle de publicación:", error);
    res.status(500).send("Error al cargar el detalle de la publicación");
  }
}

module.exports = {
  verDetallePublicacion,
};