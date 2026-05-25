const express = require("express");
const router = express.Router();

const imagenController = require("../controllers/imagenController");
const { requireLogin } = require("../middlewares/authMiddleware");

router.post("/:id/comentarios", requireLogin, imagenController.comentarImagen);

router.post("/:id/valoraciones", requireLogin, imagenController.valorarImagen);

module.exports = router;