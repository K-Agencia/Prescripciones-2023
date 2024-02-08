// const isImage = require("is-image");
const multer = require("multer")

const diskstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { fieldname } = file;
    cb(null, `src/uploads/${fieldname}`);
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    const name = new Date();
    const ext = originalname.slice(originalname.lastIndexOf('.')).toLowerCase();
    cb(null, `${name.getTime()}${ext}`);
  }
})

const fileFilter = (req, file, cb) => {

  const extensionesPermitidas = ['.jpg', '.jpeg', '.png'];
  const extension = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();

  if (!extensionesPermitidas.includes(extension)) {
    cb(new Error('Tipo de archivo no permitido. Unicamente se aceptan archivos de tipo .jpg, .jpeg y .png'), false);
  }

}

const fileUpload = multer({
  storage: diskstorage,
  fileFilter: fileFilter
})

module.exports = fileUpload.fields([
  { name: 'firma', maxCount: 1 },
  { name: 'sello', maxCount: 1 }
])