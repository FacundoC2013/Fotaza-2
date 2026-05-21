const mysql = require("mysql2/promise");
require("dotenv").config();

let connection = null;

async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT),
    });

    console.log("Conexión correcta a MySQL.");
  }

  return connection;
}

module.exports = getConnection;