'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var libroSchema = Schema({
    autor: String,
    titulo: String,
    tituloBusqueda: [],
    descripcion: String,
    copias: Number,
    disponibles: Number,
    temas: String,
    palabrasClave: [],
    tipo: String,
    image: String,
    busquedas: Number,
    reservas: Number
});

module.exports = mongoose.model('libro', libroSchema);