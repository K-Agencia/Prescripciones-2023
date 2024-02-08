const fs = require("fs");
const mime = require("mime");

exports.downloadFiles = (req, res, next) => {
  const { filename } = req.body;
  const fileContent = fs.readFileSync(filename);
  const base64Data = Buffer.from(fileContent).toString("base64");
  res.send(base64Data);
  next();
};

exports.downloadFilesWeb = (req, res, next) => {
  const { filename } = req.body;

  fs.readFile(filename, (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
    } else {
      const contentType = mime.getType(filename);
      const contentLength = data.length;

      res.set("Content-Type", contentType);
      res.set("Content-Length", contentLength);
      res.send(data);
    }
  });

  next();
};

exports.deleteFiles = (req, res, next) => {
  const { productos } = req.body.prescripcion;
  const { odontologo } = req.authData;

  try {
    fs.unlinkSync(req.body.filename);
    console.log("File removed");

    for (let i = 0; i < productos.length; i++) {
      fs.unlinkSync(productos[i].imagen);
    }

    for (const property in odontologo) {
      if (property === 'firma' || property === 'sello') {
        if (odontologo[property] === null) {
          continue;
        }

        fs.unlinkSync(odontologo[property]);
      }
    }

  } catch (err) {
    throw new Error(
      `No se pudo eliminar el archivo que esta en la ruta: '${req.body.filename}'`
    );
  }
};
