const sequelize = require("../config/sequelize");

const Rol = require("./Rol");
const Usuario = require("./Usuario");
const Publicacion = require("./Publicacion");
const Imagen = require("./Imagen");
const Etiqueta = require("./Etiqueta");
const PublicacionEtiqueta = require("./PublicacionEtiqueta");
const Comentario = require("./Comentario");
const Valoracion = require("./Valoracion");
const Seguidor = require("./Seguidor");
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

// Imagen - Comentario
Imagen.hasMany(Comentario, {
  foreignKey: "id_imagen",
  as: "comentarios",
});

Comentario.belongsTo(Imagen, {
  foreignKey: "id_imagen",
  as: "imagen",
});

// Usuario - Comentario
Usuario.hasMany(Comentario, {
  foreignKey: "id_usuario",
  as: "comentarios",
});

Comentario.belongsTo(Usuario, {
  foreignKey: "id_usuario",
  as: "autorComentario",
});

// Imagen - Valoracion
Imagen.hasMany(Valoracion, {
  foreignKey: "id_imagen",
  as: "valoraciones",
});

Valoracion.belongsTo(Imagen, {
  foreignKey: "id_imagen",
  as: "imagen",
});

// Usuario - Valoracion
Usuario.hasMany(Valoracion, {
  foreignKey: "id_usuario",
  as: "valoracionesRealizadas",
});

Valoracion.belongsTo(Usuario, {
  foreignKey: "id_usuario",
  as: "autorValoracion",
});
// Usuario - Usuario: seguimiento
Usuario.belongsToMany(Usuario, {
  through: Seguidor,
  as: "seguidos",
  foreignKey: "id_seguidor",
  otherKey: "id_seguido",
});

Usuario.belongsToMany(Usuario, {
  through: Seguidor,
  as: "seguidores",
  foreignKey: "id_seguido",
  otherKey: "id_seguidor",
});

// Relaciones directas de la tabla intermedia
Seguidor.belongsTo(Usuario, {
  foreignKey: "id_seguidor",
  as: "usuarioSeguidor",
});

Seguidor.belongsTo(Usuario, {
  foreignKey: "id_seguido",
  as: "usuarioSeguido",
});

module.exports = {
  sequelize,
  Rol,
  Usuario,
  Publicacion,
  Imagen,
  Etiqueta,
  PublicacionEtiqueta,
  Comentario,
  Valoracion,
  Seguidor,
};