const mysql = require('mysql2');

const param = {
    host: '62.109.12.174',
    user: 'bestchange-user',
    database: "navigator",
    password: 'nicklzxnicklzx',
    waitForConnections: true,
};
const sesParams = {
  host: "localhost",
  user: "sessions",
  password: "1234",
  database: "widget",
};

function createConnection() {
  return mysql.createConnection(param);
}

function sessionConnection() {
  let con = mysql.createConnection(param);

  con.on("error", function (err) {
    console.log("cannot connect session", err);
  });

  return con;
}

module.exports = { createConnection, sessionConnection };
