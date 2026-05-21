const express = require("express");
const router = express.Router();

const publicacionController = require("../controllers/publicacionController");

router.get("/:id", publicacionController.verDetallePublicacion);

module.exports = router;