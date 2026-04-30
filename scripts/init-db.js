const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function ejecutarArchivoSQL(connection, rutaArchivo) {
  const sql = fs.readFileSync(rutaArchivo, "utf8");

  console.log(`Ejecutando ${path.basename(rutaArchivo)}...`);
  await connection.query(sql);
  console.log(`${path.basename(rutaArchivo)} ejecutado correctamente.`);
}

async function inicializarBaseDeDatos() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true,
    });

    const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
    const seedPath = path.join(__dirname, "..", "database", "seed.sql");

    await ejecutarArchivoSQL(connection, schemaPath);
    await ejecutarArchivoSQL(connection, seedPath);

    console.log("Base de datos inicializada correctamente.");
  } catch (error) {
    console.error("Error al inicializar la base de datos:");
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

inicializarBaseDeDatos();