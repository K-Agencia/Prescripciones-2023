const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

exports.compressImage = (req, res, next) => {

   const { odontologo } = req.authData;
   const imagenes = req.files;

   for (const property in imagenes) {

      const dataImage = imagenes[property][0];
      const imagenOriginal = fs.readFileSync(dataImage.path);
      const filename = odontologo.cedulas + '.jpg';

      sharp(imagenOriginal)
         .resize({ width: 300 })
         .flatten({ background: { r: 255, g: 255, b: 255 } })
         .modulate({ contrast: 5 })
         .sharpen()
         .toFormat('jpg')
         .toBuffer((err, buffer) => {
            if (err) next(err); 
            fs.writeFileSync(path.join(dataImage.destination, filename), buffer);
            fs.rmSync(dataImage.path);
         });

   }
}
