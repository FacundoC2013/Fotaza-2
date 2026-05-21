const sequelize = require("../config/sequelize");

const Rol = require("./Rol");
const Usuario = require("./Usuario");
const Publicacion = require("./Publicacion");
const Imagen = require("./Imagen");
const Etiqueta = require("./Etiqueta");
const PublicacionEtiqueta = require("./PublicacionEtiqueta");

// Rol - Usuario
Rol.hasMany(Usuario, {
  foreignKey: "id_rol",
  as: "usuarios",
});

Usuario.belongsTo(Rol, {
  foreignKey: "id_rol",
  as: "rol",
});

// Usuario - Publicacion
Usuario.hasMany(Publicacion, {
  foreignKey: "id_usuario",
  as: "publicaciones",
});

Publicacion.belongsTo(Usuario, {
  foreignKey: "id_usuario",
  as: "autor",
});

// Publicacion - Imagen
Publicacion.hasMany(Imagen, {
  foreignKey: "id_publicacion",
  as: "imagenes",
});

Imagen.belongsTo(Publicacion, {
  foreignKey: "id_publicacion",
  as: "publicacion",
});

// Publicacion - Etiqueta N:N
Publicacion.belongsToMany(Etiqueta, {
  through: PublicacionEtiqueta,
  foreignKey: "id_publicacion",
  otherKey: "id_etiqueta",
  as: "etiquetas",
});

Etiqueta.belongsToMany(Publicacion, {
  through: PublicacionEtiqueta,
  foreignKey: "id_etiqueta",
  otherKey: "id_publicacion",
  as: "publicaciones",
});

module.exports = {
  sequelize,
  Rol,
  Usuario,
  Publicacion,
  Imagen,
  Etiqueta,
  PublicacionEtiqueta,
};