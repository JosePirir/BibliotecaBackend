'use strict'

var express = require('express');
var libroController = require('../controllers/libro.controller');
var connectMultyparty = require('connect-multiparty');
var mdAuth = require('../middlewares/authenticated');
const upload = connectMultyparty({uploadDir: './uploads/libro'})

var api = express.Router();

api.post('/saveLibro', [mdAuth.ensureAuth, mdAuth.ensureAuthAdminBibliotecario] , libroController.saveLibro); //ya

api.put('/updateLibro/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdminBibliotecario], libroController.updateLibro);

api.put('/deleteLibro/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdminBibliotecario], libroController.deleteLibro);

api.get('/getLibros', libroController.getLibros); //1/2

api.put('/:idU/reservar/:idL', mdAuth.ensureAuth, libroController.reservar); //ya

api.put('/:idU/regresar/:idL', mdAuth.ensureAuth ,libroController.regresar); //ya

api.put('/uploadLibroImage/:idL', [mdAuth.ensureAuth, upload], libroController.uploadLibroImage);

api.get('/getImageLibro/:fileName', [upload], libroController.getImageLibro);

api.get('/reporteRevistasMasBuscadas', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], libroController.reporteRevistasMasBuscadas);

api.get('/reporteLibrosMasBuscados', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], libroController.reporteLibrosMasBuscados);

api.get('/reporteRevistasMasPrestadas', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], libroController.reporteRevistasMasPrestadas);

api.get('/reporteLibrosMasPrestados', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], libroController.reporteLibrosMasPrestados);

api.get('/reporteUsuariosPrestado', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], libroController.reporteUsuariosPrestado);

api.post('/massiveCharge', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], libroController.massiveCharge);

module.exports = api;