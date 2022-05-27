const maria = require("mysql");

const pool = maria.createConnection({
  host: process.env.DB_IP_ADDRESS,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB,
  port: process.env.DB_PORT,
});

module.exports = pool;
