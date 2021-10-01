'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var connectMultyparty = require('connect-multiparty');
var mdAuth = require('../middlewares/authenticated');
const upload = connectMultyparty({uploadDir: './uploads/user'})

var api = express.Router();

api.post('/login', userController.login);//ya

api.post('/saveUser', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.saveUser);//ya

api.put('/updateUser/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.updateUser);//ya

api.delete('/deleteUser/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.deleteUser);//ya

api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.getUsers);//ya

api.get('/getReservaciones/:id', userController.getReservaciones); //ya

api.get('/getHistorial/:id', userController.getHistorial); //ya

api.put('/uploadImage/:id', [mdAuth.ensureAuth, upload], userController.uploadImage);

api.get('/getImage/:fileName', [upload], userController.getImage);

module.exports = api;