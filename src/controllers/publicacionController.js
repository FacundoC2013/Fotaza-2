const {
  Publicacion,
  Imagen,
  Usuario,
  Etiqueta,
  Comentario,
  Valoracion,
} = require("../models");

async function verDetallePublicacion(req, res) {
  try {
    const idPublicacion = Number(req.params.id);
    const idUsuarioActual = req.session?.usuario?.id_usuario || null;

    if (!idPublicacion) {
      return res.status(400).send("ID de publicación invalido");
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
          include: [
            {
              model: Comentario,
              as: "comentarios",
              where: {
                estado: "activo",
              },
              required: false,
              include: [
                {
                  model: Usuario,
                  as: "autorComentario",
                  attributes: ["id_usuario", "nombre", "apellido"],
                },
              ],
            },
            {
              model: Valoracion,
              as: "valoraciones",
              attributes: ["id_valoracion", "id_usuario", "puntaje"],
              required: false,
            },
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
      return res.status(404).send("Publicacion no encontrada");
    }

    const publicacion = publicacionDB.get({ plain: true });

    publicacion.esAutor =
      idUsuarioActual &&
      Number(publicacion.autor.id_usuario) === Number(idUsuarioActual);

    publicacion.imagenes = publicacion.imagenes.map((imagen) => {
      const cantidadValoraciones = imagen.valoraciones.length;

      const sumaPuntajes = imagen.valoraciones.reduce(
        (total, valoracion) => total + valoracion.puntaje,
        0
      );

      const promedioValoraciones =
        cantidadValoraciones > 0
          ? (sumaPuntajes / cantidadValoraciones).toFixed(1)
          : null;

      const yaValoro = idUsuarioActual
        ? imagen.valoraciones.some(
            (valoracion) =>
              Number(valoracion.id_usuario) === Number(idUsuarioActual)
          )
        : false;

      return {
        ...imagen,
        cantidadValoraciones,
        promedioValoraciones,
        yaValoro,
      };
    });

    res.render("publicaciones/detalle", {
  titulo: publicacion.titulo,
  publicacion,
  error: req.query.error || null,
  exito: req.query.exito || null,
});
  } catch (error) {
    console.error("Error al ver detalle de publicacion:", error);
    res.status(500).send("Error al cargar el detalle de la publicacion");
  }
}

module.exports = {
  verDetallePublicacion,
};