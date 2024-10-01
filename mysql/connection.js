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
// connection.execute(`SELECT 
//   f.Pessoa_cpf_Pessoa AS Funcionario_Pessoa_cpf_Pessoa, 
//   f.Salario_Funcionario, 
//   p.Nome_Pessoa AS Funcionario, 
//   COALESCE(SUM(ped.Comissao_valor), 0) AS comissao, 
//   (f.Salario_Funcionario + COALESCE(SUM(ped.Comissao_valor), 0)) AS total
// FROM 
//   Funcionario f
// LEFT JOIN 
//   Pedido ped 
//   ON f.Pessoa_cpf_Pessoa = ped.Funcionario_Pessoa_cpf_Pessoa 
//   AND ped.Pedido_data >= ?
//   AND ped.Pedido_data <= ?
// JOIN 
//   Pessoa p 
//   ON f.Pessoa_cpf_Pessoa = p.cpf_Pessoa
// GROUP BY 
//   f.Pessoa_cpf_Pessoa, f.Salario_Funcionario, p.Nome_Pessoa
// ORDER BY 
//   p.Nome_Pessoa;
// `,['2023-06-01','2023-07-01'],(err,result)=>{
// console.log(result)
// });
module.exports={connection: connection}