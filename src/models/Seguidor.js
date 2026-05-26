const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");

class Seguidor extends Model {}
Seguidor.init(
  {
    id_seguidor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    id_seguido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Seguidor",
    tableName: "seguidores",
    timestamps: false,
  }
);
module.exports = Seguidor;