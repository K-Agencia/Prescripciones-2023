const puppeteer = require('puppeteer');
const fs = require('fs');
const qrcode = require("qrcode");
const path = require('path');
const { buildHTML } = require('../helpers/buildHTML');
const { base64Image } = require('../helpers/base64Image');

const getFecha = () => {
   const fechaActual = new Date();
   const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
   return (`${fechaActual.getDate()} / ${meses[fechaActual.getMonth()]} / ${fechaActual.getFullYear()}`);
}

const createQRCode = async (url) => {

   let objOptions = {
      margin: 0
   }

   const QR = await qrcode.toDataURL(url, objOptions);
   return (QR);
}

exports.createPDF = async (req, res, next) => {

   const {
      paciente,
      prescripcion
   } = req.body;

   const { odontologo } = req.authData;

   const serial = new Date().getTime();
   let fileName = `${serial}-businesscard.pdf`;

   const domain = `https://${req.headers.host}`;
   const encoded = Buffer.from(prescripcion.id.toString()).toString('base64');
   const info = encodeURI(`${domain}/api/prescripcion/${encoded}`);
   const qr_code = await createQRCode(info);

   const browser = await puppeteer.launch({ headless: 'new' });
   const page = await browser.newPage();

   const rutaPlantilla = path.join(__dirname, '..', 'view/templete.html');

   const nombreOdontologo = `${odontologo.nombres} ${odontologo.apellidos}`;

   let contenidoHTML = fs.readFileSync(rutaPlantilla, 'utf-8');
   contenidoHTML = contenidoHTML.replace('{{TARJETA_COLGATE_PASS}}', await base64Image(path.join(__dirname, '../view/fondo.svg'), 'svg+xml'));
   contenidoHTML = contenidoHTML.replace('{{FECHA_ACTUAL}}', getFecha());
   contenidoHTML = contenidoHTML.replace('{{NOMBRE_PACIENTE}}', paciente.nombre);
   contenidoHTML = contenidoHTML.replace('{{APELLIDO_PACIENTE}}', paciente.apellido);
   contenidoHTML = contenidoHTML.replace('{{CEDULA_PACIENTE}}', new Intl.NumberFormat('es-MX').format(paciente.cedula));
   contenidoHTML = contenidoHTML.replace('{{CEDULA_DOCTOR}}', odontologo.cedulas);
   contenidoHTML = contenidoHTML.replace('{{NOMBRE_DOCTOR_1}}', nombreOdontologo);
   contenidoHTML = contenidoHTML.replace('{{NOMBRE_DOCTOR_2}}', nombreOdontologo);
   contenidoHTML = contenidoHTML.replace('{{NOMBRE_DOCTOR_3}}', nombreOdontologo);
   contenidoHTML = contenidoHTML.replace('{{TELEFONO_DOCTOR}}', odontologo.telefono);
   contenidoHTML = contenidoHTML.replace('{{LISTA_PRODUCTOS}}', await buildHTML({ productos: prescripcion.productos }));
   contenidoHTML = contenidoHTML.replace('{{RECOMENDACIONES}}', prescripcion.recomendaciones);
   contenidoHTML = contenidoHTML.replace('{{QR_INFORMATION}}', `${qr_code}`);
   contenidoHTML = contenidoHTML.replace('{{FIRMA_DOCTOR}}', odontologo.firma ? await base64Image(odontologo.firma) : await base64Image(path.join(__dirname, '../view/blanco.png')));
   contenidoHTML = contenidoHTML.replace('{{SELLO_DOCTOR}}', odontologo.sello ? await base64Image(odontologo.sello) : await base64Image(path.join(__dirname, '../view/blanco.png')));


   await page.setContent(contenidoHTML);

   const rutaPDF = path.join(__dirname, '..', 'uploads', fileName);
   await page.pdf({
      path: rutaPDF,
      printBackground: true,
      format: 'A4'
   });

   console.log(`Archivo PDF generado con éxito en: ${rutaPDF}`);

   await browser.close();

   req.body.filename = rutaPDF;
   next();

}