const deleteFiles = require('../helpers/gestionFiles');
const createPDF = require('./createPDF');
const isExist = require('../helpers/testExistFile');

exports.add_prescripcion = (req, res) => {

   const {
      paciente,
      prescripcion,
      odontologo,
   } = req.body

   // let datos = {
   //    v_cedula: cedula,
   //    v_first_name: first_name,
   //    v_last_name: last_name,
   //    v_doctor_name: doctor_name,
   //    v_doctor_celula: doctor_celula,
   //    v_telefono: telefono
   // }

   // console.log({
   //    paciente,
   //    prescripcion,
   //    odontologo,
   // });

   let htmlPdf = createPDF({
      paciente,
      prescripcion,
      odontologo,
   });

   // let valor = isExist(htmlPdf);

   // console.log('htmlPdf', htmlPdf);
   // console.log('valor', valor);

   // if (valor) {
   //    // console.loghtmlPdf

   //    const file = `${__dirname}/src/uploads/${htmlPdf}`;
   //    res.download(file);
   //    res.send(`Descargado ${file}`)

   //    // setTimeout(() => {
   //    //    deleteFiles(htmlPdf);
   //    // }, 10000);
   // }
}