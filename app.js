const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const {connection} = require('./mysql/connection')
const { authenticated } = require("./helpers/authenticated");
const { censureCpf, formatCpf } = require('./helpers/cpf')
const passport = require('passport')
var session = require('express-session');
const app = express();

let category = [
    {
        id: '1',
        name: 'Vendas',
        allow: false
    },
    {
        id: '2',
        name: 'Estoque',
        allow: true
    },
    {
        id: '3',
        name: 'Logística',
        allow: true
    },
    {
        id: '4',
        name: 'Recursos Humanos',
        allow: false
    },
    {
        id: '5',
        name: 'Suporte',
        allow: false
    },
]

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
    res.render('menu',{imagemFuncionario: 'alex.jpg', nomeFuncionario: 'Alex Jorge correia', cpfFuncionario: censureCpf(formatCpf('95478123685')), contatoFuncionario: '(44) 99999-9999', category: category})
})
app.get('/services/:id', authenticated, (req,res)=>{
    res.render('menu',{imagemFuncionario: 'alex.jpg', nomeFuncionario: 'Alex Jorge correia', cpfFuncionario: censureCpf(formatCpf('95478123685')), contatoFuncionario: '(44) 99999-9999', category: category})
})
app.get('/account', authenticated, (req,res)=>{
    res.send('dfosisdif')
})
app.listen(process.env.PORT || 8080); 