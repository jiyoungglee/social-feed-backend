var fs = require('fs');
const mysql = require('mysql');
require('dotenv').config();

const serverCa = [fs.readFileSync(process.env.CERTIFICATE, "utf8")];

const db = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port:3306,
  ssl: {
      rejectUnauthorized: true,
      ca: serverCa
  }
});

db.connect(function(err) {
if (err) throw err;
});

module.exports = db;
