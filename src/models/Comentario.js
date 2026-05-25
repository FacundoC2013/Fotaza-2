const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");

class Comentario extends Model {}

Comentario.init(
  {
    id_comentario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_imagen: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    texto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "activo",
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Comentario",
    tableName: "comentarios",
    timestamps: false,
  }
);

module.exports = Comentario;