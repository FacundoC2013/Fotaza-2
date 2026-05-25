const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");

class Valoracion extends Model {}

Valoracion.init(
  {
    id_valoracion: {
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
    puntaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Valoracion",
    tableName: "valoraciones",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["id_usuario", "id_imagen"],
      },
    ],
  }
);

module.exports = Valoracion;