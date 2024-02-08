exports.validateID = (req, res, next) => {

   const id = parseInt(Buffer.from(req.params.id, 'base64').toString('ascii'));

   if (Number.isInteger(id)) {
      req.body.id = id;
      next();
   } else {
      res.send('El ID de la prescipción es incorrecto');
   }


}