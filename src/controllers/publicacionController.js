const { Op } = require("sequelize");
const {
  Publicacion,
  Imagen,
  Usuario,
  Etiqueta,
  Comentario,
  Valoracion,
  Seguidor,

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

    publicacion.esAutor = Boolean(
      idUsuarioActual &&
      publicacion.autor &&
      Number(publicacion.autor.id_usuario) === Number(idUsuarioActual)
    );

    publicacion.sigueAutor = false;

    if (idUsuarioActual && !publicacion.esAutor && publicacion.autor) {
      const seguimiento = await Seguidor.findOne({
        where: {
          id_seguidor: Number(idUsuarioActual),
          id_seguido: Number(publicacion.autor.id_usuario),
        },
      });

      publicacion.sigueAutor = Boolean(seguimiento);
    }

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
async function verPublicacionesSeguidos(req, res) {
  try {
    const idUsuarioActual = Number(req.session.usuario.id_usuario);

    const seguimientos = await Seguidor.findAll({
      where: {
        id_seguidor: idUsuarioActual,
      },
      attributes: ["id_seguido"],
    });

    const idsSeguidos = seguimientos.map(
      (seguimiento) => seguimiento.id_seguido
    );

    if (idsSeguidos.length === 0) {
      return res.render("publicaciones/siguiendo", {
        titulo: "Publicaciones de usuarios seguidos",
        publicaciones: [],
      });
    }

    const publicacionesDB = await Publicacion.findAll({
      where: {
        estado: "activa",
        id_usuario: {
          [Op.in]: idsSeguidos,
        },
      },
      include: [
        {
          model: Usuario,
          as: "autor",
          attributes: ["id_usuario", "nombre", "apellido"],
        },
        {
          model: Imagen,
          as: "imagenes",
          attributes: ["id_imagen", "titulo", "ruta_archivo", "licencia"],
          required: false,
        },
        {
          model: Etiqueta,
          as: "etiquetas",
          attributes: ["id_etiqueta", "nombre"],
          through: {
            attributes: [],
          },
          required: false,
        },
      ],
      order: [["fecha_creacion", "DESC"]],
    });

    const publicaciones = publicacionesDB.map((publicacion) =>
      publicacion.get({ plain: true })
    );

    res.render("publicaciones/siguiendo", {
      titulo: "Publicaciones de usuarios seguidos",
      publicaciones,
    });
  } catch (error) {
    console.error("Error al cargar publicaciones de usuarios seguidos:", error);
    res.status(500).send("Error al cargar publicaciones de usuarios seguidos");
  }
}
function mostrarFormularioNuevaPublicacion(req, res) {
  res.render("publicaciones/nueva", {
    titulo: "Nueva publicación",
    error: null,
    datos: {},
  });
}
async function guardarNuevaPublicacion(req, res) {
  try {
    const idUsuario = Number(req.session.usuario.id_usuario);

    const {
      titulo,
      descripcion,
      tituloImagen,
      descripcionImagen,
      licencia,
      textoMarcaAgua,
    } = req.body;

    const datos = {
      titulo,
      descripcion,
      tituloImagen,
      descripcionImagen,
      licencia,
      textoMarcaAgua,
    };

    if (!titulo || !titulo.trim()) {
      return res.render("publicaciones/nueva", {
        titulo: "Nueva publicación",
        error: "El título de la publicación es obligatorio.",
        datos,
      });
    }

    if (!tituloImagen || !tituloImagen.trim()) {
      return res.render("publicaciones/nueva", {
        titulo: "Nueva publicación",
        error: "El título de la imagen es obligatorio.",
        datos,
      });
    }

    if (!licencia) {
      return res.render("publicaciones/nueva", {
        titulo: "Nueva publicación",
        error: "Debe seleccionar una licencia.",
        datos,
      });
    }

    if (!req.file) {
      return res.render("publicaciones/nueva", {
        titulo: "Nueva publicación",
        error: "Debe seleccionar una imagen.",
        datos,
      });
    }

    const publicacion = await Publicacion.create({
      id_usuario: idUsuario,
      titulo: titulo.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      estado: "activa",
      permite_editar: true,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    });

    const rutaArchivo = `/uploads/imagenes/${req.file.filename}`;

    await Imagen.create({
      id_publicacion: publicacion.id_publicacion,
      titulo: tituloImagen.trim(),
      descripcion: descripcionImagen ? descripcionImagen.trim() : null,
      ruta_archivo: rutaArchivo,
      licencia,
      marca_agua: req.body.marcaAgua === "on",
      texto_marca_agua: textoMarcaAgua ? textoMarcaAgua.trim() : null,
      comentarios_abiertos: req.body.comentariosAbiertos === "on",
      fecha_subida: new Date(),
    });

    res.redirect(`/publicaciones/${publicacion.id_publicacion}`);
  } catch (error) {
    console.error("Error al guardar nueva publicación:", error);

    res.status(500).send("Error al guardar la publicación");
  }
}

module.exports = {
  verDetallePublicacion,
  verPublicacionesSeguidos,
  mostrarFormularioNuevaPublicacion,
  guardarNuevaPublicacion,
};