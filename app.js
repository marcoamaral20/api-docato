const express = require('express');
const morgan = require('morgan');
const bodyparser = require('body-parser');

const app = express();

const rotaUsuarios = require('./routes/usuarios');
const {getProducts} = require('./crawler/getProducts')

app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: false}));
app.use(bodyparser.json());

app.use((req, res, next)=> {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
         'Access-Control-Allow-Header',
         'Origin, X-Requrested-With, Content-Type, Accept, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.header(
            {'Access-Control-Allow-Origin': '*',
        'access-control-allow-methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        'Access-Control-Allow-Headers':
        'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, access-control-allow-methods, Access-Control-Request-Headers'});
        return res.status(200).send({});
    }

    next();
})

app.use('/usuarios', rotaUsuarios);

app.use('/crawler', async (req, res) => {
    const response = await getProducts()

    return res.json({response})
});

app.use((req, res, next) => {
    const erro = new Error('Não encontrado');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            mensagem: error.message
        }
    });
})

module.exports = app;