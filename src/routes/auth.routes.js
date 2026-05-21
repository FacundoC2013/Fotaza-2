const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.get("/login", authController.mostrarLogin);
router.post("/login", authController.procesarLogin);
router.post("/logout", authController.cerrarSesion);

module.exports = router;