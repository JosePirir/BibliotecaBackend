'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    identifier: Number,
    name: String,
    lastname: String,
    username: String,
    password: String,
    email: String,
    image: String,
    contadorHistorial: Number,
    role: String,
    contadorLibros: Number,
    libro: [{type: Schema.ObjectId, ref:'libro'}],
    historial: [{type: Schema.ObjectId, ref:'libro'}] 
});

module.exports = mongoose.model('user', userSchema);