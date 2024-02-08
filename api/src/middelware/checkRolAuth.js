exports.varificarRol = (roles) => (req, res, next) => {
  const {
    odontologo: { rol },
  } = req.authData;

  if ([].concat(roles).includes(rol)) {
    next();
  } else {
    res.status(409).send({
      error: "No tienen permisos",
    });
  }
};
