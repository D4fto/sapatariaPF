const argon2 = require("argon2")
const mysql2 = require('mysql2');
// Create the connection to database
const connection = mysql2.createConnection({
  host: 'db4free.net',
  user: 'sapatariapf',
  database: 'sapatariapf',
  password: '123456789'
});
connection.connect((err) => {
  if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      return;
  }
  console.log('Conectado ao banco de dados!');
});
module.exports={connection: connection}