const { Publicacion, Imagen, Usuario, Etiqueta } = require("../models");

async function mostrarHome(req, res) {
  try {
    const publicacionesDB = await Publicacion.findAll({
      where: {
        estado: "activa",
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
      order: [["fecha_creacion", "DESC"]],
      limit: 10,
    });

    const publicaciones = publicacionesDB.map((publicacion) =>
      publicacion.get({ plain: true })
    );

    res.render("index", {
      titulo: "Fotaza 2",
      publicaciones,
    });
  } catch (error) {
    console.error("Error al cargar la home:", error);
    res.status(500).send("Error al cargar la página principal");
  }
}

module.exports = {
  mostrarHome,
};