const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const {connection} = require('./mysql/connection')
const { authenticated } = require("./helpers/authenticated");
const { censureCpf, formatCpf } = require('./helpers/cpf')
const passport = require('passport')
var session = require('express-session');
const multer = require('multer');
const app = express();
const fs = require('fs');
const path = require('path');

// Função para verificar se um arquivo .hbs existe
function verificarArquivoHbs(nomeArquivo) {
  // Define o caminho completo do arquivo (ajuste o caminho conforme necessário)
  const caminhoArquivo = path.join(__dirname, 'views', `${nomeArquivo}.handlebars`);

  // Verifica se o arquivo existe
  if (fs.existsSync(caminhoArquivo)) {
    return true
  } else {
    return false 
  }
} 

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,"public/imgs/")
    },
    filename: function(req, file, cb){
        arq=file.originalname.replaceAll(' ','_')+Date.now()+path.extname(file.originalname)
        console.log(arq)
        cb(null, arq)
        connection.execute('UPDATE `sapatariapf`.`Funcionario` SET `Imagem_Funcionario` = ? WHERE `Pessoa_cpf_Pessoa` = ?;',[arq,req.user.Pessoa_cpf_Pessoa])
    }
});
const upload = multer({storage});


// Exemplo de uso
verificarArquivoHbs('meuArquivo');

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
                    allow: element.nome_Categoria=='Suporte'?1:element.possui
                })
            }
            connection.query('SELECT Mensagem.*, Cargo_id_Cargo, Nome_Pessoa FROM sapatariapf.Mensagem, Funcionario, Pessoa where Funcionario_Pessoa_cpf_Pessoa=Pessoa_cpf_Pessoa and Pessoa_cpf_Pessoa=cpf_Pessoa order by CreatedAt DESC LIMIT 40;',(err, mensagens)=>{
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
app.post('/alterar_img', authenticated, upload.single("file"), (req,res) =>{
    res.redirect('/account')
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
                    allow: element.nome_Modulo=='FAQ'?1:element.possui
                })
            }
            connection.query('SELECT Mensagem.*, Cargo_id_Cargo, Nome_Pessoa FROM sapatariapf.Mensagem, Funcionario, Pessoa where Funcionario_Pessoa_cpf_Pessoa=Pessoa_cpf_Pessoa and Pessoa_cpf_Pessoa=cpf_Pessoa order by CreatedAt DESC LIMIT 40;',(err, mensagens)=>{
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
    connection.execute(`SELECT * FROM sapatariapf.Modulo where Categoria_id_Categoria = ? and id_Modulo=?;`,
        [req.params.id,req.params.id2],
        (err, result)=>{
            if(result){
                connection.query('SELECT Mensagem.*, Cargo_id_Cargo, Nome_Pessoa FROM sapatariapf.Mensagem, Funcionario, Pessoa where Funcionario_Pessoa_cpf_Pessoa=Pessoa_cpf_Pessoa and Pessoa_cpf_Pessoa=cpf_Pessoa order by CreatedAt DESC LIMIT 40;',(err, mensagens)=>{
                    const dados = {
                        imagemFuncionario: req.user.Imagem_Funcionario, 
                        nomeFuncionario: req.user.Nome_Pessoa, 
                        cpfFuncionario: censureCpf(formatCpf(req.user.Pessoa_cpf_Pessoa)), 
                        cpfFuncionario2: req.user.Pessoa_cpf_Pessoa, 
                        contatoFuncionario: formatarTelefone(req.user.telefone_Pessoa), 
                        mensagens: mensagens,
                        Nome: result[0].nome_Modulo
                    }
                    if(verificarArquivoHbs(`service_${req.params.id2}`)){
                        res.render(`service_${req.params.id2}`,dados)
                        return
                    }
                    else{
                        res.render('aaa',dados)
                        return
                    }
                })
                return
            }
            else{
                res.redirect('/menu')
                return
            }
        })
    }
)
app.get('/account', authenticated, (req,res)=>{
    connection.execute(`SELECT Endereco.*, Nome_Cidade, Nome_Estado FROM sapatariapf.Endereco, Cidade, Estado, Funcionario_has_Endereco where id_Cidade=Cidade_id_Cidade and Estado_id_Estado=id_Estado and id_Endereco=Endereco_id_Endereco and Funcionario_Pessoa_cpf_Pessoa=?;`,
        [req.user.Pessoa_cpf_Pessoa],
        (err, result)=>{
            connection.query(`SELECT * FROM Estado;`
                ,(erro, states)=>{
                    connection.query('SELECT Mensagem.*, Cargo_id_Cargo, Nome_Pessoa FROM sapatariapf.Mensagem, Funcionario, Pessoa where Funcionario_Pessoa_cpf_Pessoa=Pessoa_cpf_Pessoa and Pessoa_cpf_Pessoa=cpf_Pessoa order by CreatedAt DESC LIMIT 40;',(err, mensagens)=>{
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
app.get('/vendasFuncionario', authenticated, (req,res)=>{
    const dataMin = req.query.dataMin?req.query.dataMin:'0000-01-01'
    const dataMax = req.query.dataMax?req.query.dataMax:'9999-12-12'
    const cliente = req.query.cliente?`%${req.query.cliente}%`:'%%'
    const valorMin = req.query.valorMin?parseInt(req.query.valorMin): -1
    const valorMax = req.query.valorMax?parseInt(req.query.valorMax): 9999999999999999
    connection.execute(
        `SELECT Pedido.*, Nome_Pessoa as cliente FROM sapatariapf.Pedido, Cliente, Pessoa 
        where Funcionario_Pessoa_cpf_Pessoa=? and Pedido_data>=? and Pedido_data<=? 
        and Cliente_Pessoa_cpf_Pessoa=Pessoa_cpf_Pessoa and Pessoa_cpf_Pessoa = cpf_Pessoa and Nome_Pessoa LIKE ? and Valor_Total>=? and Valor_Total<=? ORDER BY Pedido_data;`,
        [req.user.Pessoa_cpf_Pessoa, dataMin, dataMax, cliente, valorMin, valorMax],
        (err, result)=>{
            console.log(result)
            result.forEach((element)=>{
                element.Pedido_data = extrairData(element.Pedido_data)
                element.Comissao_taxa = element.Comissao_taxa*100
            })
            connection.query('SELECT Mensagem.*, Cargo_id_Cargo, Nome_Pessoa FROM sapatariapf.Mensagem, Funcionario, Pessoa where Funcionario_Pessoa_cpf_Pessoa=Pessoa_cpf_Pessoa and Pessoa_cpf_Pessoa=cpf_Pessoa order by CreatedAt DESC LIMIT 40;',(err, mensagens)=>{
                res.render('vendasFuncionario',{
                    imagemFuncionario: req.user.Imagem_Funcionario, 
                    nomeFuncionario: req.user.Nome_Pessoa, 
                    cpfFuncionario: censureCpf(formatCpf(req.user.Pessoa_cpf_Pessoa)), 
                    cpfFuncionario3: formatCpf(req.user.Pessoa_cpf_Pessoa), 
                    cpfFuncionario2: req.user.Pessoa_cpf_Pessoa, 
                    contatoFuncionario: formatarTelefone(req.user.telefone_Pessoa), 
                    vendas: result,
                    mensagens: mensagens
                })
            })
        }
    )
    
})
app.get('/pagamento',authenticated,(req,res)=>{
    const dataMin = req.query.dataMin?req.query.dataMin:'0000-01-01'
    const dataMax = req.query.dataMax?req.query.dataMax:'9999-12-12'
    connection.execute(
        `SELECT 
        f.Pessoa_cpf_Pessoa AS Funcionario_Pessoa_cpf_Pessoa, 
        f.Salario_Funcionario, 
        p.Nome_Pessoa AS Funcionario, 
        COALESCE(SUM(ped.Comissao_valor), 0) AS comissao, 
        (f.Salario_Funcionario + COALESCE(SUM(ped.Comissao_valor), 0)) AS total
        FROM 
        Funcionario f
        LEFT JOIN 
        Pedido ped 
        ON f.Pessoa_cpf_Pessoa = ped.Funcionario_Pessoa_cpf_Pessoa 
        AND ped.Pedido_data >= ?
        AND ped.Pedido_data <= ?
        JOIN 
        Pessoa p 
        ON f.Pessoa_cpf_Pessoa = p.cpf_Pessoa
        GROUP BY 
        f.Pessoa_cpf_Pessoa, f.Salario_Funcionario, p.Nome_Pessoa
        ORDER BY 
        p.Nome_Pessoa;`,
        [dataMin, dataMax],
        (err, result)=>{
            console.log(result)
            connection.query('SELECT Mensagem.*, Cargo_id_Cargo, Nome_Pessoa FROM sapatariapf.Mensagem, Funcionario, Pessoa where Funcionario_Pessoa_cpf_Pessoa=Pessoa_cpf_Pessoa and Pessoa_cpf_Pessoa=cpf_Pessoa order by CreatedAt DESC LIMIT 40;',(err, mensagens)=>{
                res.render('pagamento',{
                    imagemFuncionario: req.user.Imagem_Funcionario, 
                    nomeFuncionario: req.user.Nome_Pessoa, 
                    cpfFuncionario: censureCpf(formatCpf(req.user.Pessoa_cpf_Pessoa)), 
                    cpfFuncionario3: formatCpf(req.user.Pessoa_cpf_Pessoa), 
                    cpfFuncionario2: req.user.Pessoa_cpf_Pessoa, 
                    contatoFuncionario: formatarTelefone(req.user.telefone_Pessoa), 
                    pagamentos: result,
                    mensagens: mensagens
                })
            })
        }
    )
})
app.post('/atualizar', authenticated, (req, res)=>{
    
})
app.listen(process.env.PORT || 8080); 