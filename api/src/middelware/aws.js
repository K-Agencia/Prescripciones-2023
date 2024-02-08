const AWS = require("aws-sdk");
const path = require("path");
const fs = require("fs");
const { delete_images } = require("../helpers/delete_images");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

const s3 = new AWS.S3();

const aws_s3 = (files, action) => {
  const promises = [];

  files.forEach(({ path, fieldname, filename }) => {
    const fileStream = path ? fs.createReadStream(path) : null;

    const params = {
      Body: fileStream,
      Bucket: `${process.env.AWS_BUCKET_NAME}${fieldname ? `/${fieldname}` : ""
        }`,
      Key: filename,
    };

    promises.push(s3[action](params).promise());
  });

  return Promise.all(promises);
};

exports.aws_files_upload = async (req, res, next) => {
  const files = req.files;

  try {
    const data = [];
    const aws = {};

    for (const property in files) {
      data.push(files[property][0]);
    }

    const response = await aws_s3(data, "upload");

    for (let i = 0; i < response.length; i++) {
      const name = response[i].Key.split("/")[0];
      aws[name] = response[i];
    }

    req.aws = aws;
    next();
  } catch (error) {
    next(error);
  }
};

exports.aws_get_files = async (req, res, next) => {
  const { key } = req.query;
  const { key_aws } = req.body;

  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key || key_aws,
    };

    const data = await s3.getObject(params).promise();

    req.aws = { file: data };
    next();
  } catch (err) {
    next(err);
  }
};

exports.aws_savefiles = async (req, res, next) => {
  const { productos } = req.body.prescripcion;
  const { odontologo } = req.authData;

  try {

    for (let i = 0; i < productos.length; i++) {

      const filePath = path.join(__dirname, '..', 'uploads', `${productos[i].imagen}`);

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: productos[i].imagen,
      };

      const data = await s3.getObject(params).promise();

      fs.writeFileSync(filePath, data.Body);

      productos[i].imagen = filePath;
    }

    for (const property in odontologo) {
      if (property === 'firma' || property === 'sello') {
        if (odontologo[property] === null) {
          continue;
        }

        const filePath = path.join(__dirname, '..', 'uploads', `${odontologo[property]}`);

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: odontologo[property],
        };

        const data = await s3.getObject(params).promise();

        fs.writeFileSync(filePath, data.Body);

        odontologo[property] = filePath;
      }
    }

    next();
  } catch (err) {
    next(err);
  }

};

exports.aws_delete_files = async (req, res, next) => {
  const { img_del } = req.body;
  const files = req.files;

  try {
    const params = [];
    const data = [];

    for (const property in files) {
      data.push(files[property][0]);
    }

    data.forEach(({ fieldname }) => {
      const imagen = img_del.find(
        ({ tipo_imagen }) => tipo_imagen === fieldname
      );

      if (imagen) {
        params.push({
          filename: imagen.nombre,
        });
      }
    });

    await aws_s3(params, "deleteObject");
    next();
  } catch (err) {
    next(err);
  }
};
