'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var userRoutes = require('./routes/user.route')
var libroRoutes = require('./routes/libro.route')

var cors = require('cors');

var app = express();

app.use(bodyParser.urlencoded({extends:false}))
app.use(bodyParser.json());
app.use(cors());

/*app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});*/

app.use('/api', userRoutes);
app.use('/api', libroRoutes);

module.exports = app;