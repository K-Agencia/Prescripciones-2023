exports.buildJson = (req, res, next) => {
  const { id, prescripcion, odontologo, productos } = req.body;

  const lista_productos = productos.map(({ codigo_ndf, nombre, consumer_unit }) => {
    return { codigo_ndf, consumer_unit, nombre };
  });
  
  const opciones = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };

  res.send({
    prescripcion: {
      id,
      productos: lista_productos,
    },
    odontologo: {
      cedula: odontologo.cedulas,
      codigo_colgate: odontologo.codigo_col,
      nombre: `${odontologo.nombres.toUpperCase()} ${odontologo.apellidos.toUpperCase()}`,
    },
    fecha_registro: new Date(prescripcion.create_at).toLocaleString(
      "es-CO",
      opciones
    ),
  });
};
