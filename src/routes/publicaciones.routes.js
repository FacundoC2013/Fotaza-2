const express = require("express");
const router = express.Router();

const publicacionController = require("../controllers/publicacionController");
const { requireLogin } = require("../middlewares/authMiddleware");
const upload = require("../config/multer");
router.get(
  "/siguiendo",
  requireLogin,
  publicacionController.verPublicacionesSeguidos
);
router.get(
  "/nueva",
  requireLogin,
  publicacionController.mostrarFormularioNuevaPublicacion
);
router.post(
  "/",
  requireLogin,
  upload.single("imagen"),
  publicacionController.guardarNuevaPublicacion
);
router.get("/buscar", publicacionController.buscarPublicaciones);

router.get("/:id", publicacionController.verDetallePublicacion);

module.exports = router;