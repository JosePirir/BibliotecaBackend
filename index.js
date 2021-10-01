'use strict'

var mongoose = require('mongoose')
var port = '3200'
var userController = require('./controllers/user.controller');
var app = require('./app')

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/Biblioteca', {useNewUrlParser: true, userFindAndModify: true})
    .then(()=>{
        console.log('conectado a la base de datos')
        userController.createAdmin();
        app.listen(port, ()=>{
            console.log('servidor de express funcionando')
        })
    })
    .catch((err)=>{console.log('Error al tratar de contectarse a la base de datos', err)})