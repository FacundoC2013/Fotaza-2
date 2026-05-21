const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");

class PublicacionEtiqueta extends Model {}

PublicacionEtiqueta.init(
  {
    id_publicacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_etiqueta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: "PublicacionEtiqueta",
    tableName: "publicacion_etiqueta",
    timestamps: false,
  }
);

module.exports = PublicacionEtiqueta;