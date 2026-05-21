const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");

class Imagen extends Model {}

Imagen.init(
  {
    id_imagen: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_publicacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ruta_archivo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    licencia: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    marca_agua: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    texto_marca_agua: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    comentarios_abiertos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    fecha_subida: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Imagen",
    tableName: "imagenes",
    timestamps: false,
  }
);

module.exports = Imagen;