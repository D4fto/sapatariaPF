const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const {connection} = require('./mysql/connection')
const { authenticated } = require("./helpers/authenticated");
const { censureCpf, formatCpf } = require('./helpers/cpf')
const passport = require('passport')
var session = require('express-session');
const app = express();

function extrairData(data){
    // Convertendo a string para um objeto Date
    const data2 = new Date(data);
    // Extraindo apenas a parte da data (ano, mês, dia)
    return data2.toISOString().split('T')[0];
}

function formatarTelefone(numero) {
    // Remove todos os caracteres que não são dígitos
    numero = numero.toString().replace(/\D/g, '');
    
    // Extrai o DDD e o número
    const ddd = numero.substring(0, 2);
    const parte1 = numero.substring(2, 7);  // Primeira parte (cinco dígitos)
    const parte2 = numero.substring(7, 11); // Segunda parte (quatro dígitos)
    
    // Retorna no formato desejado
    return `(${ddd}) ${parte1}-${parte2}`;
}
//session
app.use(session({
    secret: 'fonfsonfsdofndfssdfoisdfnsdf',
    resave: true,
    saveUninitialized: true
}));

//passport
app.use(passport.initialize())
app.use(passport.session())
require("./config/auth")(passport)

//BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Handlebars
app.engine('handlebars', exphbs.engine({defaultLayout:'default'}));
app.set('view engine', 'handlebars');
app.set('views', './views');

//Defining the public folder
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index', {notchat: true}); 
});
app.post('/login', (req,res,next) => {
    passport.authenticate("local", {
        successRedirect: "/menu",
        failureRedirect: '/',
        failureFlash: false
    })(req, res, next)
})
app.get('/menu', authenticated, (req,res)=>{
    connection.execute(`SELECT id_Categoria, nome_Categoria, id_Categoria IN (SELECT Categoria_id_Categoria FROM sapatariapf.Modulo where id_Modulo in (SELECT Modulo_id_Modulo FROM sapatariapf.Modulo_has_Funcionario where Funcionario_Pessoa_cpf_Pessoa = ?)) as 'possui' FROM sapatariapf.Categoria;`,
        [req.user.Pessoa_cpf_Pessoa],
        (err, result)=>{
            let category = []
            for (let i = 0; i < result.length; i++) {
                const element = result[i];
                category.push({
                    id: element.id_Categoria,
                    name: element.nome_Categoria,
                    allow: element.possui
                })
            }
            connection.query('SELECT Mensagem.*, Cargo_id_Cargo, Nome_Pessoa FROM sapatariapf.Mensagem, Funcionario, Pessoa where Funcionario_Pessoa_cpf_Pessoa=Pessoa_cpf_Pessoa and Pessoa_cpf_Pessoa=cpf_Pessoa order by CreatedAt LIMIT 20;',(err, mensagens)=>{
                res.render('menu',{
                    imagemFuncionario: req.user.Imagem_Funcionario, 
                    nomeFuncionario: req.user.Nome_Pessoa, 
                    cpfFuncionario: censureCpf(formatCpf(req.user.Pessoa_cpf_Pessoa)), 
                    cpfFuncionario2: req.user.Pessoa_cpf_Pessoa, 
                    contatoFuncionario: formatarTelefone(req.user.telefone_Pessoa), 
                    mensagens: mensagens,
                    cargo: req.user.Cargo_id_Cargo,
                    category: category
                })
            })
    })
})
app.get('/services/:id', authenticated, (req,res)=>{
    connection.execute(`SELECT *, id_Modulo in (SELECT Modulo_id_Modulo FROM sapatariapf.Modulo_has_Funcionario where Funcionario_Pessoa_cpf_Pessoa = ?) as 'possui' FROM sapatariapf.Modulo where Categoria_id_Categoria = ?;`,
        [req.user.Pessoa_cpf_Pessoa,req.params.id],
        (err, result)=>{
            let modules = []
            for (let i = 0; i < result.length; i++) {
                const element = result[i];
                modules.push({
                    id: String(element.Categoria_id_Categoria)+'/'+String(element.id_Modulo),
                    name: element.nome_Modulo,
                    allow: element.possui
                })
            }
            connection.query('SELECT Mensagem.*, Cargo_id_Cargo, Nome_Pessoa FROM sapatariapf.Mensagem, Funcionario, Pessoa where Funcionario_Pessoa_cpf_Pessoa=Pessoa_cpf_Pessoa and Pessoa_cpf_Pessoa=cpf_Pessoa order by CreatedAt LIMIT 20;',(err, mensagens)=>{
                res.render('menu',{
                    imagemFuncionario: req.user.Imagem_Funcionario, 
                    nomeFuncionario: req.user.Nome_Pessoa, 
                    cpfFuncionario: censureCpf(formatCpf(req.user.Pessoa_cpf_Pessoa)), 
                    cpfFuncionario2: req.user.Pessoa_cpf_Pessoa, 
                    contatoFuncionario: formatarTelefone(req.user.telefone_Pessoa), 
                    mensagens: mensagens,
                    cargo: req.user.Cargo_id_Cargo,
                    category: modules
                })
            })
    })
})
app.get('/services/:id/:id2', authenticated, (req,res)=>{
    connection.execute(`SELECT * FROM sapatariapf.Modulo where Categoria_id_Categoria = ? and ;`,
        [req.params.id],
        (err, result)=>{
            res.send(result[0].nome_Modulo)
        })
})
app.get('/account', authenticated, (req,res)=>{
    connection.execute(`SELECT Endereco.*, Nome_Cidade, Nome_Estado FROM sapatariapf.Endereco, Cidade, Estado, Funcionario_has_Endereco where id_Cidade=Cidade_id_Cidade and Estado_id_Estado=id_Estado and id_Endereco=Endereco_id_Endereco and Funcionario_Pessoa_cpf_Pessoa=?;`,
        [req.user.Pessoa_cpf_Pessoa],
        (err, result)=>{
            connection.query(`SELECT * FROM Estado;`
                ,(erro, states)=>{
                    console.log(result)
                    console.log(states)
                    connection.query('SELECT Mensagem.*, Cargo_id_Cargo, Nome_Pessoa FROM sapatariapf.Mensagem, Funcionario, Pessoa where Funcionario_Pessoa_cpf_Pessoa=Pessoa_cpf_Pessoa and Pessoa_cpf_Pessoa=cpf_Pessoa order by CreatedAt LIMIT 20;',(err, mensagens)=>{
                        console.log(mensagens)
                        res.render('account',{
                            imagemFuncionario: req.user.Imagem_Funcionario, 
                            nomeFuncionario: req.user.Nome_Pessoa, 
                            cpfFuncionario: censureCpf(formatCpf(req.user.Pessoa_cpf_Pessoa)), 
                            cpfFuncionario3: formatCpf(req.user.Pessoa_cpf_Pessoa), 
                            cpfFuncionario2: req.user.Pessoa_cpf_Pessoa, 
                            contatoFuncionario: formatarTelefone(req.user.telefone_Pessoa), 
                            salario: (req.user.Salario_Funcionario).toFixed(2),
                            adimissao: extrairData(req.user.Adimissao_Funcionario),
                            comissao: req.user.Comissao_Funcionario*100,
                            endereco: result[0],
                            estados: states,
                            cargo: req.user.Cargo_id_Cargo,
                            mensagens: mensagens
                        })
                    })
                }
            )
    })
})
app.get('/kkk',(req,res)=>{
    res.render('aaa')
})
app.listen(process.env.PORT || 8080); 