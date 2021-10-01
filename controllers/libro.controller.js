'use strict'

var Libro = require('../models/libro.model');
var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

function saveLibro(req, res){
    var libro = new Libro();
    var params = req.body;

    if('admin' != req.user.role && 'bibliotecario' != req.user.role){
        res.status(403).send({message: 'No tienes permisos para guardar un libro'})
    }else{
        if(params.autor && params.titulo && params.descripcion && params.copias && params.disponibles && params.temas && params.palabrasClave && params.tipo){
            Libro.findOne({titulo: params.titulo.toLowerCase()}, (err, libroFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al buscar libros existentes'})
                }else if(libroFind){
                    return res.send({message: 'El libro ya existe, pruebe con otro nombre de libro'})
                }else{
                    libro.autor = params.autor;
                    libro.titulo = params.titulo.toLowerCase();
                    libro.tituloBusqueda = libro.titulo.split(' ');
                    libro.descripcion = params.descripcion;
                    libro.copias = params.copias;
                    libro.disponibles = params.disponibles;
                    libro.temas = params.temas;
                    libro.busquedas = 0;
                    libro.reservas = 0;
                    libro.palabrasClave = params.palabrasClave.replace(/[' ']+/g, '').split(',');
                    libro.tipo =  params.tipo;


                    libro.save((err, libroSaved)=>{
                        if(err){
                            return res.status(500).send({message: 'Error al guardar usuario'})
                        }else if(libroSaved){
                            return res.status(200).send({message: 'Libro guardado', libroSaved})
                        }else{
                            return res.status(500).send({message: 'No se guardó el usuario'});
                        }
                    })
                }
            })
        }else{
            res.status(403).send({message: 'Por favor, ingrese todos los campos'})
        }
    }
}

function updateLibro(req, res){
    let libroId = req.params.id;
    let data = req.body;

    if(('admin' != req.user.role) && ('bibliotecario' != req.user.role)){
        res.status(403).send({message: 'No tienes permisos para actualizar un libro'})
    }else{
        if(data.titulo){
            data.tituloBusqueda = data.titulo.split(' ');
            
            Libro.findOne({titulo: data.titulo.toLowerCase()}, (err, libroFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error al buscar'})
                }else if(libroFind){
                    return res.send({message: 'El titulo del libro ya existe'})
                }else{
                    Libro.findByIdAndUpdate(libroId, data, {new: true}, (err, libroUpdated)=>{
                        if(err){
                            return res.status(500).send({message: 'error general'})
                        }else if(libroUpdated){   
                            return res.status(200).send({message: 'Libro actualizado', libroUpdated})
                        }else{
                            return res.status(500).send({message: 'no se pudo actualizar el libro'})
                        }
                    })
                }
            })
        }else{
        Libro.findByIdAndUpdate(libroId, data, {new: true}, (err, libroUpdated)=>{
            if(err){
                res.status(500).send({message: 'Error al actualizar'})
            }else if(libroUpdated){
                res.send({message: 'Libro actualizado ', libroUpdated})
            }else{
                res.send({message: 'No se actualizo el libro'})
            }
        })
    }}
}

function deleteLibro (req, res){
    let libroId = req.params.id;

    if('admin' != req.user.role && 'bibliotecario' != req.user.role){
        res.status(403).send({message: 'No tienes permisos para eliminar un libro'});
    }else{
        Libro.findOne({_id: libroId}, (err, libroFind)=>{
            if(err){
                res.status(500).send({message: 'Error general', err})
            }else if(libroFind){
                Libro.findByIdAndRemove(libroId, (err, libroRemoved)=>{
                    if(err){
                        res.status(500).send({message: 'Error al eliminar usuario'})
                    }else if(libroRemoved){
                        res.send({message: 'Libro eliminado',libroRemoved})
                    }else{
                        res.send({message: 'No se pudo eliminar el libro'})
                    }
                })
            }else{
                res.status(404).send({message: 'El libro no existe'})
            }
        })
    }
}

function getLibros (req, res){
    var params = req.body;

        if('copias' == params.buscar){
            Libro.find({}).sort({copias: -1}).exec((err, librosFind)=>{
                if(err){
                    res.status(500).send({message: 'Error general al buscar libros'})
                }else if(librosFind){
                    res.send({message: 'Libros encontrados (por copias)', librosFind})
                }else{
                    res.send({message: 'No existe ningun libro'})
                }
            })
        }else if('disponibles' == params.buscar){
            Libro.find({}).sort({disponibles: -1}).exec((err, librosFind)=>{
                if(err){
                    res.status(500).send({message: 'Error general al buscar libros'})
                }else if(librosFind){
                    res.send({message: 'Libros encontrados (por disponibles)', librosFind})
                }else{
                    res.send({message: 'No existe ningun libro'})
                }
            })
        }else if('tipo' == params.buscar){
            Libro.find({}).sort({tipo: 0}).exec((err, librosFind)=>{
                if(err){
                    res.status(500).send({message: 'Error general al buscar libros'})
                }else if(librosFind){
                    res.send({message: 'Libros encontrados (por tipo)', librosFind})
                }else{
                    res.send({message: 'No existe ningun libro'})
                }
            })
        }else if(params.search){
            Libro.find({$or: [{titulo: params.search}, {palabrasClave: params.search}, {tituloBusqueda: params.search}]}).exec((err, librosFind)=>{
                if(err){
                    res.status(500).send({message: 'Error general al buscar libros', err})
                }else if(librosFind){
                    if(librosFind.length == 0){
                        res.send({message: 'No se enctontraron resultados'})
                    }else{
                        Libro.updateMany({_id: librosFind},{$inc: {busquedas: 1}}, {new:true}, (err, aumento)=>{
                        })
                        res.send({message: 'Libros encontrados', librosFind})
                    }
                }else{
                        res.send({message: 'No existe ningun libro'})
                }
            });
        }else{
            Libro.find({}).exec((err, libros)=>{
                if(err){
                    res.status(500).send({message: 'Error al buscar usuarios'})
                }else if(libros){
                    res.send({message: 'Usuarios encontrados: ', libros})
                }else{
                    res.send({message: 'No existe ningun usuario'})
                }
            })        
        }
}

function reservar(req, res){
    let userId = req.params.idU;
    let libroId = req.params.idL;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tiene permisos para realizar la reservación'})
    }else{
    Libro.findById(libroId, (err, libroFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al buscar libros'})
        }else if(libroFind){
            User.findById(userId, (err, userFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al buscar el usuario'})
                }else if(userFind){
                    User.findOne({_id: userId, libro:libroId}, (err, libroDup)=>{
                        if(err){
                            return res.send({message: 'Error general al encontrar libros duplicados'})
                        }else if(libroDup){
                            return res.send({message: 'El libro ya esta reservado'})
                        }else{
                            if(userFind.contadorLibros >= 10){
                                return res.send({message: 'Solo puedes reservar como máximo 10 libros'})
                            }else{
                            User.findByIdAndUpdate(userId, {$push: {libro: libroFind._id}}, {new: true}, (err, userPush)=>{
                                if(err){
                                    res.send({message: 'Error general al actualizar'})
                                }else if(userPush){
                                    User.findByIdAndUpdate(userId, {$push: {historial: libroFind._id}}, {new: true}, (err, historialPush)=>{
                                        if(err){
                                            res.send({message: 'Error general al actualizar'})
                                        }else if(historialPush){
                                            User.findByIdAndUpdate(userId, {$inc: {contadorLibros: 1}}, {new:true}, (err, aumentoU)=>{
                                            })
                                            User.findByIdAndUpdate(userId, {$inc: {contadorHistorial: 1}}, {new:true}, (err, aumentoU)=>{
                                            })
                                            Libro.findByIdAndUpdate(libroId, {$inc: {reservas: 1}}, {new:true}, (err, aumentoL)=>{
                                            })
                                            res.send({message: 'Reservacion realizada', historialPush})                    
                                        }else{
                                            res.send({message: 'No se guardo en el historial'})
                                        } 
                                    })
                                }else{
                                    res.send({message: 'No se guardo la reservación'})
                                }
                            })
                        }}
                    })
                }else{
                    res.send({message: 'No se encontro el usuario'})
                }
            })
        }else{
            res.send({message: 'No se encontro el libro'})
        }
    })}
}



function regresar(req, res){
    let userId = req.params.idU;
    let libroId = req.params.idL;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tiene permisos para cancelar la reservación'})
    }else{
    Libro.findById(libroId, (err, libroFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al buscar libros'})
        }else if(libroFind){
            User.findById(userId, (err, userFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al buscar el usuario'})
                }else if(userFind){
                    User.findOne({_id:userId, libro: libroId}, (err, libroFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error al buscar libros'})
                        }else if(libroFind){
                            User.findByIdAndUpdate({_id: userId},{$pull:{libro: libroId}}, (err, userPush)=>{
                                if(err){
                                    res.send({message: 'Error general al actualizar'})
                                }else if(userPush){
                                    User.findByIdAndUpdate(userId, {$inc: {contadorLibros: -1}}, {new:true}, (err, aumento)=>{
                                    })
                                    res.send({message: 'Reservacion cancelada', userPush})
                                }else{
                                    res.send({message: 'No se guardo la reservación'})
                                }
                            }).populate({path:'libro', populate:{path:'user'}})
                        }else{
                            return res.status(200).send({message: 'No se puede cancelar reservacion porque el libro no está reservado'})
                        }
                    })         
                }else{
                    res.send({message: 'No se encontro el usuario'})
                }
            })
        }else{
            res.send({message: 'No se encontro el libro'})
        }
    })}
}

/*function reporte (req, res){
    var params = req.body;

    if('admin' != req.user.role){
        res.status(403).send({message: 'No tienes permisos para generar reportes'})
    }else{
    if('UsuariosPrestado' == params.reporte){
        User.find({}).sort({contadorLibros:-1}).exec((err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'error general'})
            }else if(userFind){
                return res.status(200).send({message: 'Los usuarios que más reservaciones han hecho son: ', userFind})
            }else{
                return res.status(200).send({message: 'No se encontraron usuarios'})
            }
        })
    }else if('LibrosMasPrestados'==params.reporte){
        Libro.find({tipo: 'libro'}).sort({reservas:-1}).exec((err, libroPrestadoFind)=>{
            if(err){
                return res.status(500).send({message: 'error general'})
            }else if(libroPrestadoFind){
                return res.status(200).send({message: 'Los libros más prestados son: ', libroPrestadoFind})
            }else{
                return res.status(200).send({message: 'No se encontraron libros'})
            }
        })
    }else if('RevistasMasPrestadas'==params.reporte){
        Libro.find({tipo: 'revista'}).sort({reservas:-1}).exec((err, revistaPrestadaFind)=>{
            if(err){
                return res.status(500).send({message: 'error general'})
            }else if(revistaPrestadaFind){
                return res.status(200).send({message: 'Las revistas más prestados son: ', revistaPrestadaFind})
            }else{
                return res.status(200).send({message: 'No se encontraron revistas'})
            }
        })
    }else if('LibrosMasBuscados'==params.reporte){
        Libro.find({tipo: 'libro'}).sort({busquedas:-1}).exec((err, libroBuscadoFind)=>{
            if(err){
                return res.status(500).send({message: 'error general'})
            }else if(libroBuscadoFind){
                return res.status(200).send({message: 'Los libros más buscados son: ', libroBuscadoFind})
            }else{
                return res.status(200).send({message: 'No se encontraron libros'})
            }
        })
    }else if('RevistasMasBuscadas'==params.reporte){
        Libro.find({tipo: 'revista'}).sort({busquedas:-1}).exec((err, revistaBuscadaFind)=>{
            if(err){
                return res.status(500).send({message: 'error general'})
            }else if(revistaBuscadaFind){
                return res.status(200).send({message: 'Las revistas más buscadas son: ', revistaBuscadaFind})
            }else{
                return res.status(200).send({message: 'No se encontraron revistas'})
            }
        })
    }else{
        return res.status(200).send({message: 'Establezca un criterio de reporte'})
    }
}
}*/

//libro img

function uploadLibroImage(req, res){
    var libroId = req.params.idL;
    var update = req.body;
    var fileName;

    if('admin' != req.user.role && 'bibliotecario' != req.user.role){
        res.status(403).send({message: 'No tienes permisos para actualizar la imagen de un libro'});
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
            Libro.findByIdAndUpdate(libroId, {image: fileName}, {new: true}, (err, libroUpdated)=>{
                if(err){
                    res.status(500).send({message: 'error al actualizar foto de perfil'})
                }else if(libroUpdated){
                    res.status(200).send({libro: libroUpdated, libroImage:libroUpdated.image})
                    console.log(filePath);
                    console.log(fileSplit);
                    console.log(fileName);
                    console.log(fileExt);
                }else{
                    res.status(400).send({message: 'No se pudo actualizar'})
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

function getImageLibro(req, res){
    var  fileName  = req.params.fileName;
    var pathFile = './uploads/libro/' + fileName;

    fs.exists(pathFile, (exists)=>{
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(404).send({message: 'La imagen no existe'})
        }
    })
}

/*
function massiveCharge (req, res){
    var libroSave = new Libro();
    var params = req.body;

    if('admin' != req.user.role && 'bibliotecario' != req.user.role){
        res.status(403).send({message: 'No tienes permisos para guardar un libro'})
    }else{
        if(params.text){
            let i = 0;
            var texto = params.text;
            var libroInicio = texto.split(/\n/);
            while(i < libroInicio.length){
            var texto = params.text;/////////////////////
            var libro = texto.split(/\n/);
            var libroSplit = libro[i];
            var dataSplit = libroSplit.split(';')
            var tipo = dataSplit[0];
            if(tipo == 1){
                tipo = 'revista'
            }else if(tipo == 0){
                tipo = 'libro'
            }else{
                res.status(401).send({message: 'Ingrese valores 0 ó 1 (libro ó revista)'})
            }
            var autor = dataSplit[1];
            var titulo = dataSplit[2];
            var descripcion = dataSplit[3];
            var palabrasClave = dataSplit[4];
            var temas = dataSplit[5];
            var copias = dataSplit[6];
            var disponibles = dataSplit[7];
            i++;

            if(autor && titulo && descripcion && copias && disponibles && temas && palabrasClave && tipo){
                Libro.findOne({titulo: titulo.toLowerCase()}, (err, libroFind)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al buscar libros existentes'})
                    }else if(libroFind){
                        return res.send({message: 'El libro ya existe, pruebe con otro nombre de libro'})
                    }else{
                        libroSave.tipo =  tipo;
                        libroSave.autor = autor;
                        libroSave.titulo = titulo.toLowerCase();
                        libroSave.tituloBusqueda = titulo.split(' ');
                        libroSave.descripcion = descripcion;
                        libroSave.copias = copias;
                        libroSave.disponibles = disponibles;
                        libroSave.temas = temas;
                        libroSave.busquedas = 0;
                        libroSave.reservas = 0;
                        libroSave.palabrasClave = palabrasClave.replace(/[' ']+/g, '').split(',');

                        libroSave.save((err, libroSaved)=>{
                            if(err){
                                console.log(err);
                                return res.status(500).send({message: 'Error al guardar libros'}) 
                            }else if(libroSaved){

                            }else{
                                return res.status(500).send({message: 'No se guardó el libro'});
                            }
                        })
                    }
                })
            }else{
                res.status(403).send({message: 'Por favor, ingrese todos los campos'})
            }
        }
        }else{
            return res.status(403).send({message: 'Ingrese información'})
        }
        }
    }*/


    function massiveCharge (req, res){
        var libroSave = new Libro();
        var params = req.body;

        if('admin' != req.user.role && 'bibliotecario' != req.user.role){
            res.status(403).send({message: 'No tienes permisos para guardar un libro'})
        }else{
            if(params.text){
                let contador;
                var texto = params.text;
                var libroInicio = texto.split(/\n/);
                for(contador = 0; contador < libroInicio.length; contador++){
                /*var texto = params.text;*/
                var libro = texto.split(/\n/);
                var libroSplit = libro[contador];
                var dataSplit = libroSplit.split(';');
                var tipo = dataSplit[0];
                if(tipo == 1){
                    tipo = 'revista'
                }else if(tipo == 0){
                    tipo = 'libro'
                }else{
                    res.status(401).send({message: 'Ingrese valores 0 ó 1 (libro ó revista)'})
                }
                var autor = dataSplit[1];
                var titulo = dataSplit[2];
                var descripcion = dataSplit[3];
                var palabrasClave = dataSplit[4];
                var temas = dataSplit[5];
                var copias = dataSplit[6];
                var disponibles = dataSplit[7];
    
                if(autor && titulo && descripcion && copias && disponibles && temas && palabrasClave && tipo){
                    Libro.findOne({titulo: titulo.toLowerCase()}, (err, libroFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al buscar libros existentes'})
                        }else if(libroFind){
                            return res.send({message: 'El libro ya existe, pruebe con otro nombre de libro'})
                        }else{
                            libroSave.tipo =  tipo;
                            libroSave.autor = autor;
                            libroSave.titulo = titulo.toLowerCase();
                            libroSave.tituloBusqueda = titulo.split(' ');
                            libroSave.descripcion = descripcion;
                            libroSave.copias = copias;
                            libroSave.disponibles = disponibles;
                            libroSave.temas = temas;
                            libroSave.busquedas = 0;
                            libroSave.reservas = 0;
                            libroSave.palabrasClave = palabrasClave.replace(/[' ']+/g, '').split(',');
    
                            libroSave.save((err, libroSaved)=>{
                                if(err){
                                    console.log(texto);
                                    console.log(libroInicio);
                                    console.log(libro);
                                    console.log(libroSplit);
                                    console.log(dataSplit);
                                    console.log(err);
                                    return res.status(500).send({message: 'Error al guardar libros'}) 
                                }else if(libroSaved){
                                    return res.status(200).send({message: libroSave})
                                }else{
                                    return res.status(500).send({message: 'No se guardó el libro'});
                                }
                            })
                        }
                    })
                }else{
                    res.status(403).send({message: 'Por favor, ingrese todos los campos'})
                }
            }
            }else{
                return res.status(403).send({message: 'Ingrese información'})
            }
        }
    }

    function reporteUsuariosPrestado (req, res){
        if('admin' != req.user.role){
            res.status(403).send({message: 'No tienes permisos para generar reportes'})
        }else{
            User.find({}).sort({contadorHistorial:-1}).exec((err, userFind)=>{
                if(err){
                    return res.status(500).send({message: 'error general'})
                }else if(userFind){
                    return res.status(200).send({message: 'Los usuarios que más reservaciones han hecho son: ', userFind})
                }else{
                    return res.status(200).send({message: 'No se encontraron usuarios'})
                }
            })
        }
    }

    function reporteLibrosMasPrestados (req, res){
        if('admin' != req.user.role){
            res.status(403).send({message: 'No tienes permisos para generar reportes'})
        }else{
            Libro.find({tipo: 'libro'}).sort({reservas:-1}).exec((err, libroPrestadoFind)=>{
                if(err){
                    return res.status(500).send({message: 'error general'})
                }else if(libroPrestadoFind){
                    return res.status(200).send({message: 'Los libros más prestados son: ', libroPrestadoFind})
                }else{
                    return res.status(200).send({message: 'No se encontraron libros'})
                }
            })
        }
    }

    function reporteRevistasMasPrestadas(req, res){
        if('admin' != req.user.role){
            res.status(403).send({message: 'No tienes permisos para generar reportes'})
        }else{
            Libro.find({tipo: 'revista'}).sort({reservas:-1}).exec((err, revistaPrestadaFind)=>{
                if(err){
                    return res.status(500).send({message: 'error general'})
                }else if(revistaPrestadaFind){
                    return res.status(200).send({message: 'Las revistas más prestados son: ', revistaPrestadaFind})
                }else{
                    return res.status(200).send({message: 'No se encontraron revistas'})
                }
            })
        }
    }

    function reporteLibrosMasBuscados(req,res){
        if('admin' != req.user.role){
            res.status(403).send({message: 'No tienes permisos para generar reportes'})
        }else{
            Libro.find({tipo: 'libro'}).sort({busquedas:-1}).exec((err, libroBuscadoFind)=>{
                if(err){
                    return res.status(500).send({message: 'error general'})
                }else if(libroBuscadoFind){
                    return res.status(200).send({message: 'Los libros más buscados son: ', libroBuscadoFind})
                }else{
                    return res.status(200).send({message: 'No se encontraron libros'})
                }
            })
        }
    }

    function reporteRevistasMasBuscadas(req,res){
        if('admin' != req.user.role){
            res.status(403).send({message: 'No tienes permisos para generar reportes'})
        }else{
            Libro.find({tipo: 'revista'}).sort({busquedas:-1}).exec((err, revistaBuscadaFind)=>{
                if(err){
                    return res.status(500).send({message: 'error general'})
                }else if(revistaBuscadaFind){
                    return res.status(200).send({message: 'Las revistas más buscadas son: ', revistaBuscadaFind})
                }else{
                    return res.status(200).send({message: 'No se encontraron revistas'})
                }
            })
        }
    }


module.exports = {
    saveLibro,
    updateLibro,
    deleteLibro,
    getLibros,
    reservar,
    regresar,
    uploadLibroImage,
    getImageLibro,
    reporteRevistasMasBuscadas,
    reporteLibrosMasBuscados,
    reporteRevistasMasPrestadas,
    reporteLibrosMasPrestados,
    reporteUsuariosPrestado,
    massiveCharge
}