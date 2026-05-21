const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");

class Etiqueta extends Model {}

Etiqueta.init(
  {
    id_etiqueta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Etiqueta",
    tableName: "etiquetas",
    timestamps: false,
  }
);

module.exports = Etiqueta;