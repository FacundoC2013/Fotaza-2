const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController");
const { requireLogin } = require("../middlewares/authMiddleware");

router.post("/:id/seguir", requireLogin, usuarioController.seguirUsuario);

router.post(
  "/:id/dejar-de-seguir",
  requireLogin,
  usuarioController.dejarDeSeguirUsuario
);

module.exports = router;