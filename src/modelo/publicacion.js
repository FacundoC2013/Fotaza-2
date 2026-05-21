const getConnection = require("../config/db");

async function obtenerPublicacionesHome() {
  const connection = await getConnection();

  const query = `
    SELECT 
      p.id_publicacion,
      p.titulo AS titulo_publicacion,
      p.descripcion,
      p.fecha_creacion,
      u.nombre,
      u.apellido,
      i.id_imagen,
      i.titulo AS titulo_imagen,
      i.ruta_archivo,
      i.licencia
    FROM publicaciones p
    INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
    INNER JOIN imagenes i ON p.id_publicacion = i.id_publicacion
    WHERE p.estado = ?
    ORDER BY p.fecha_creacion DESC
    LIMIT 10
  `;

  const [results] = await connection.query(query, ["activa"]);

  return results;
}

module.exports = {
  obtenerPublicacionesHome,
};