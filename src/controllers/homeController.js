const Publicacion = require("../modelo/Publicacion");

async function mostrarHome(req, res) {
  try {
    const publicaciones = await Publicacion.obtenerPublicacionesHome();

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