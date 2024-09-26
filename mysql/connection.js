
const mysql2 = require('mysql2');
// Create the connection to database
const connection = mysql2.createConnection({
  host: 'db4free.net',
  user: 'sapatariapf',
  database: 'sapatariapf',
  password: '123456789'
});

connection.query(
  'SELECT * FROM Pessoa',
  function (err, results) {
    if(err===null){
      console.log(results)
      console.log('conectado com sucesso!');
      return
    }
    console.log(err);
  }
);

module.exports={connection: connection}