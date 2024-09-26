const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const {connection} = require('./mysql/connection')
const app = express();

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
    res.render('index'); // Renderiza a view "index.handlebars"
});

app.listen(process.env.PORT || 8080); 