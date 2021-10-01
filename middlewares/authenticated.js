'user strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion-JosePirir';

exports.ensureAuth = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: 'La petición no lleva cabecera de autenticación'})
    }else{
        var token = req.headers.authorization.replace(/['"']+/g, '');
    }try{
        var payload = jwt.decode(token, secretKey);
        if(payload.exp <= moment().unix()){
            return res.status(401).send({message: 'Token ha expirado'})
        }
    }catch(err){
        return res.status(404).send({message: 'token invalido'})
    }

    req.user = payload;
    next();
}

exports.ensureAuthAdmin = (req, res, next)=>{
    var payload = req.user;

    if(payload.role != 'admin'){
        return res.status(404).send({message: 'No tienes permisos para ingresar a esta ruta (debe ser administrador)'})
    }else{
        return next();
    }
}

exports.ensureAuthAdminBibliotecario = (req, res, next)=>{
    var payload = req.user;

    if((payload.role != 'bibliotecario') && (payload.role != 'admin')){
        return res.status(404).send({message: 'No tienes permisos para ingresar a esta ruta (debe ser bibliotecario  o administrador)'})
    }else{
        return next();
    }
}