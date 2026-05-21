const express = require("express");
const path = require("path");
require("dotenv").config();

const indexRoutes = require("./routes/index.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de PUG
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rutas
app.use("/", indexRoutes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).send("Página no encontrada");
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});