const express = require("express");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const indexRoutes = require("./routes/index.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de PUG
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Middlewares para leer datos de formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fotaza2_secret_desarrollo",
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware propio para que todas las vistas PUG sepan si hay usuario logueado
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rutas
app.use("/", indexRoutes);
app.use("/", authRoutes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).send("Página no encontrada");
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});