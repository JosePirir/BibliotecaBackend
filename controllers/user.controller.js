'use strict'

var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

//Crear administrador automaticamente//

function createAdmin(req, res){
    let user = new User();
    User.findOne({username: 'adminpractica'}, (err, found)=>{
        if(err){
            console.log('Error al crear al usuario administrador', err)
        }else if(found){
            console.log('Usuario administrador ya creado')
        }else{
            user.password = 'adminpractica';
            user.role = 'admin';
            bcrypt.hash(user.password, null, null, (err, passwordHash)=>{
                if(err){
                    console.log('Error al encriptar la contraseña', err)
                }else if(passwordHash){
                    user.username = 'adminpractica';
                    user.password = passwordHash;

                    user.save((err, userSaved)=>{
                        if(err){
                            console.log('Error general al crear el usuario administrador', err)
                        }else if(userSaved){
                            console.log('Usuario administrador creado con exito', userSaved)
                        }else{
                            console.log('no se creo el usuario administrador')
                        }
                    })
                }
            })
        }
    })
}

// login //

function login (req, res){

var params = req.body;

if(params.username && params.password){
    User.findOne({username: params.username.toLowerCase()}, (err, userFind)=>{
        if(err){
            return res.status(500).send({message: 'Error al encontrar usuarios'})
        }else if(userFind){
            bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                if(err){
                    return res.status(500).send({message: 'Error general en la verificación de contraseña'});
                }else if(checkPassword){
                    if(params.gettoken){
                        delete userFind.password
                        return res.send({ token: jwt.createToken(userFind), user:userFind})
                    }else{
                        return res.send({message: 'Usuario logeado'})
                    }
                }else{
                    return res.status(401).send({message: 'Contraseña incorrecta'});
                }
            })
        }else{
            return res.send({message: 'Username incorrecto'})
        }
    })
}else{
    return res.status(401).send({message: 'Por favor ingrese los datos obligatorios'})
}
}

//Create User//

function saveUser(req, res){
    var user = new User();
    var params = req.body;

    if('admin' != req.user.role){
        res.status(403).send({message: 'No tienes permisos para acceder a esta ruta'})
    }else{
    if(params.name && params.lastname && params.username && params.email && params.password && params.identifier && params.role){
        User.findOne({username: params.username.toLowerCase()}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al buscar usuarios existentes'})
            }else if(userFind){
                return res.send({message: 'El usuario ya existe, pruebe con otro nombre de usuario'})
            }else{
                User.findOne({identifier: params.identifier}, (err, idFind)=>{
                    if(err){
                        return res.status(500).send({message: 'Error al encontrar id'})
                    }else if(idFind){
                        return res.send({message: 'El ID ya existe'})
                    }else{
                bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                    if(err){
                        return res.status(500).send({message: 'Error al encriptar la contraseña'});
                    }else if(passwordHash){
                        user.password = passwordHash;
                        user.identifier = params.identifier;
                        user.username = params.username.toLowerCase();
                        user.name = params.name;
                        user.lastname = params.lastname;
                        user.email = params.email.toLowerCase();
                        user.contadorLibros = 0;
                        user.contadorHistorial = 0;

                        if(params.role == 'admin' && req.user.username != 'adminpractica'){
                            return res.status(500).send({message: 'Solo el administrador principal puede crear más administradores'})
                        }
                        else{
                            user.role = params.role;
                        }
                        user.save((err, userSaved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error al guardar usuario'})
                            }else if(userSaved){
                                return res.status(200).send({message: 'Usuario guardado', userSaved})
                            }else{
                                return res.status(500).send({message: 'No se guardó el usuario'});
                            }
                        })
                    }else {
                        return res.status(401).send({message: 'Contraseña no encriptada'})
                    }
                })
            }
        })
        }
    })
    }else{
        return res.send({message: 'Por favor ingrese todos los campos'})
    }
    }
}

//Read Users//

function getUsers(req, res){
    if('admin' != req.user.role){
        res.status(500).send({message:'No tiene permisos de administrador'})
    }else{ 
    User.find({}).sort({identifier: -1}).exec((err, users)=>{
        if(err){
            res.status(500).send({message: 'Error al buscar usuarios'})
        }else if(users){
            res.send({message: 'Usuarios encontrados: ', users})
        }else{
            res.send({message: 'No existe ningun usuario'})
        }
    })
}
}

//Update User //

/*function updateUser(req, res){
    let userId = req.params.id;
    let data = req.body;

    if('admin' != req.user.role){
        res.status(403).send({message: 'No tienes permisos de administrador'})
    }else{
        if(data.password || data.role){
            res.status(403).send({message: 'No es posible actualizar contraseña o rol del usuario'})
        }else{
            if(data.username){
                User.findOne({username: data.username.toLowerCase()}, (err, userFind)=>{
                    if(err){
                        res.status(500).send({message: 'Error general', err})
                    }else if(userFind){
                        if(userFind._id == req.user.sub){
                            User.findByIdAndUpdate(userId, data, {new:true}, (err, userUpdated)=>{
                                if(err){
                                    res.status(500).send({message: 'error general al actualizar', err})
                                }else if(userUpdated){
                                    res.send({message: 'Ususario actualizado: ', userUpdated})
                                }else{
                                    res.send({message: 'No se actualizo el usuario'})
                                }
                            })
                        }else{
                            res.send({message: 'Nombre del usuario ya en uso'})
                        }
                    }else{
                        User.findByIdAndUpdate(userId, data, {new:true}, (err, userUpdated)=>{
                            if(err){
                                res.status(500).send({message: 'Error al actualizar y tal', err})
                            }else if(userUpdated){
                                res.send({message: 'Ususario actualizado: ', userUpdated})
                            }else{
                                res.send({message: 'No se actualizo'})
                            }
                        })
                    }   
                })
            }
        }
    }
}*/

function updateUser(req, res){
    let data = req.body;
    let userId = req.params.id;

    User.findByIdAndUpdate(userId, data, {new:true}, (err, userUpdated)=>{
        if(err){
            res.status(500).send({message: 'Error general'})
        }else if(userUpdated){
            res.send({message: 'Usuario actualizado', userUpdated});
        }else{
            res.send({message: 'No se actualizo el usuario'})
        }
        
    }
    )
}

//Delete User//
function deleteUser (req, res){
let userId = req.params.id;
let params = req.body;

if('admin' != req.user.role){
    res.status(403).send({message: 'No tienes permisos para eliminar otro usuario'});
}else{
    User.findOne({_id: userId}, (err,userFind)=>{
        if(err){
            res.status(500).send({message: 'Error general', err})
        }else if(userFind){
            /*bcrypt.compare(params.password, userFind.password, (err, passVerified)=>{
                if(err){
                    res.status(500).send({message: 'Error al verificar la contraseña'})
                }else if(passVerified){*/
                    User.findByIdAndRemove(userId, (err, userRemoved)=>{
                        if(err){
                            res.status(500).send({message: 'Error al eliminar usuario'})
                        }else if(userRemoved){
                            res.send({message: 'Usuario eliminado',userRemoved})
                        }else{
                            res.send({message: 'No se pudo eliminar el ususario'})
                        }
                    })
                /*}else{
                    res.status(401).send({message:'Contraseña incorrecta'})
                }
            })*/
        }else{
            res.status(404).send({message: 'El usuario no existe'})
        }
    })
}
}

// Upload Image //
function uploadImage(req, res){
    var userId = req.params.id;
    var update = req.body;
    var fileName;

    if(userId != req.user.sub){
        res.status(403).send({message: 'No tienes permisos para cambiar la foto de otro usuario'})
    }else{
        if(req.files){
            var filePath = req.files.image.path;
            var fileSplit = filePath.split('\\');
            var fileName = fileSplit[2];
            var extension = fileName.split('\.');
            var fileExt = extension[1];
            if(fileExt == 'png' ||
            fileExt == 'jpg' ||
            fileExt == 'jpeg' ||
            fileExt == 'gif'){
                User.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpdated)=>{
                    if(err){
                        res.status(500).send({message: 'error al actualizar foto de perfil'})
                    }else if (userUpdated){
                        res.send({user: userUpdated, userImage:userUpdated.image});
                    }else{
                        res.status(400).send({message: 'No se ha podido actualizar'})
                    }
                })
            }else{
                fs.unlink(filePath, (err)=>{
                    if(err){
                        res.status(500).send({message: 'Extension no valida y error al eliminar archivo'})
                    }else{
                        res.status(400).send({message: 'Extension no valida'})
                    }
                })
            }
        }else{
            res.status(400).send({message: 'No has envidado imagen a subir'})
        }
    }
}

function getImage(req, res){
    var fileName = req.params.fileName;
    var pathFile = './uploads/user/' +fileName;

    fs.exists(pathFile, (exists)=>{
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(404).send({message: 'Imagen inexistente'})
        }
    })
}

function getReservaciones(req, res){
    var userId = req.params.id;

    User.findById(userId).populate({
        path:'libro',
        populate:{
            path:'user',
        }
    }).exec((err, reservas)=>{
        if(err){
            return res.status(500).send({message: 'Error general al buscar reservas'})
        }else if(reservas){
            res.status(200).send({message: 'Reservaciones: ', reservas})
        }else{
            return res.status(404).send({message: 'No se han hecho reservaciones'})
        }
    })
}

function getHistorial(req, res){
    var userId = req.params.id;

    User.findById(userId).populate({
        path:'historial',
        populate:{
            path:'user',
        }
    }).exec((err, historial)=>{
        if(err){
            return res.status(500).send({message: 'Error general'})
        }else if(historial){
            return res.status(200).send({message: 'Historial de reservaciones:', historial})
        }else{
            return res.status(404).send({message: 'No se encontraron elementos en el historial'})
        }
    })
}


module.exports = {
    createAdmin,
    saveUser,
    updateUser,
    login,
    getUsers,
    getReservaciones,
    getHistorial,
    deleteUser,
    uploadImage,
    getImage
}