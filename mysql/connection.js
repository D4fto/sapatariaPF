const argon2 = require("argon2")
const mysql2 = require('mysql2');
// Create the connection to database
const connection = mysql2.createConnection({
  host: 'db4free.net',
  user: 'sapatariapf',
  database: 'sapatariapf',
  password: '123456789'
});
console.log(argon2.hash('pablo').then((senha)=>{
  console.log(senha)
}))
connection.execute(
  'SELECT * FROM Pessoa WHERE id_Pessoa = ? and Nome_Pessoa = ? LIMIT 1',
  [1, 'pabla'],
  function (err, usuario) {
    if(err===null){
        console.log(usuario[0]==undefined)
      }
      console.log(err)
  }
);
module.exports={connection: connection}