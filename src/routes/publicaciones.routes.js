const express = require("express");
const router = express.Router();

const publicacionController = require("../controllers/publicacionController");
const { requireLogin } = require("../middlewares/authMiddleware");
router.get(
  "/siguiendo",
  requireLogin,
  publicacionController.verPublicacionesSeguidos
);
router.get("/:id", publicacionController.verDetallePublicacion);

module.exports = router;