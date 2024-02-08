const express = require('express');
const apicache = require('apicache');

const { createPDF } = require('../middelware/createPDF');
const { downloadFiles, deleteFiles, downloadFilesWeb } = require('../helpers/gestionFiles');
const { post_data_prescripcion, get_imagenes_productos, get_lista_productos, get_prescripcion, get_login, get_prescripciones, get_key_image, put_data_user, get_login_lector, get_data_prescripcion } = require('../middelware/database');
const { validateDataUsers, sendDataUsers, sendToken } = require('../middelware/loginUsers');
const { getDataAuth } = require('../middelware/getDataAuth');
const { verificarToken } = require('../middelware/token');
const fileUpload = require('../middelware/fileUpload');
const { varificarRol } = require('../middelware/checkRolAuth');
const { buildJson } = require('../middelware/builJson');
const { validateID } = require('../middelware/validateID');
const { send_image } = require('../middelware/send_image');
const { aws_get_files, aws_files_upload, aws_delete_files, aws_savefiles } = require('../middelware/aws');
const { KAGENCIA, ODONTOLOGO, COLGATE, QR } = require('../constants/roles');
const { delete_images } = require('../helpers/delete_images');
const { formart_date } = require('../middelware/format_date');

const app = express();
const cache = apicache.middleware;

app.get('/', (req, res) => res.send('Ok!'));
app.get('/login', getDataAuth, get_login, validateDataUsers);
app.get('/lector', getDataAuth, get_login_lector, sendToken);
app.get('/user', verificarToken, varificarRol([KAGENCIA, ODONTOLOGO, COLGATE]), get_login, sendDataUsers);
app.get('/products', verificarToken, varificarRol([KAGENCIA, ODONTOLOGO, COLGATE]), cache('5 minutes'), get_lista_productos);
app.get('/lista', verificarToken, varificarRol([KAGENCIA, ODONTOLOGO]), get_prescripciones, formart_date);
app.get('/pres/:id', verificarToken, varificarRol([KAGENCIA, ODONTOLOGO]), get_prescripcion);
app.get('/prescripcion/:id', verificarToken, varificarRol([KAGENCIA, QR]), validateID, get_prescripcion, buildJson);
app.get('/img', cache('10 minutes'), aws_get_files, send_image);
// app.get('/download/:id', get_data_prescripcion, get_imagenes_productos, aws_savefiles, createPDF, downloadFiles, deleteFiles);
app.get('/download/:id', verificarToken, varificarRol([KAGENCIA, ODONTOLOGO, COLGATE]), get_data_prescripcion, get_imagenes_productos, aws_savefiles, createPDF, downloadFiles, deleteFiles);
app.get('/download/web/:id', verificarToken, varificarRol([KAGENCIA, ODONTOLOGO, COLGATE]), get_data_prescripcion, get_imagenes_productos, aws_savefiles, createPDF, downloadFilesWeb, deleteFiles);
// app.get('/download/:id', verificarToken, varificarRol([KAGENCIA, ODONTOLOGO, COLGATE]), get_data_prescripcion, get_imagenes_productos, createPDF);

app.post('/prescripcion/add', verificarToken, varificarRol([KAGENCIA, ODONTOLOGO, COLGATE]), post_data_prescripcion, get_imagenes_productos, aws_savefiles, createPDF, downloadFiles, deleteFiles);

app.post('/prescripcion/add/web', verificarToken, varificarRol([KAGENCIA, ODONTOLOGO, COLGATE]), post_data_prescripcion, get_imagenes_productos, aws_savefiles, createPDF, downloadFilesWeb, deleteFiles);

// app.put('/user', verificarToken, varificarRol([KAGENCIA, ODONTOLOGO]), fileUpload, get_key_image, aws_delete_files, aws_files_upload, put_data_user, get_login, validateDataUsers);

app.put('/user', verificarToken, varificarRol([KAGENCIA, ODONTOLOGO]), fileUpload, get_key_image, aws_delete_files, aws_files_upload, put_data_user, get_login, validateDataUsers, delete_images);

module.exports = app;