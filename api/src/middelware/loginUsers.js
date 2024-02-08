const { crearToken } = require("./token");

exports.validateDataUsers = (req, res, next) => {
  const { data } = req.body;
  const { nombres, firma, sello } = data[0];
  let fotos = false;

  if (firma !== null) {
    fotos = true;
  }

  res.status(200).json({
    token: crearToken(data[0]),
    data: { nombres, fotos },
  });
};

exports.sendToken = (req, res, next) => {
  const { data } = req.body;
  res.send(crearToken(data[0]))
}

exports.sendDataUsers = (req, res, next) => {
  const { data } = req.body;
  res.status(200).send(data[0]);
};