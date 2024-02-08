const { sendQueryDataBase } = require("../config/model_database");

exports.get_login = (req, res, next) => {
  const { password } = req.body;
  const authData = req.authData;

  const query = `
    SELECT 
      U.idusuarios AS id, R.roles AS rol, U.cedulas AS cedula, U.codigo_col, U.nombres, U.apellidos, U.telefonos AS telefono,
      (SELECT nombre FROM imagenes WHERE idusuarios = U.idusuarios AND idtipo_imagenes = 1) AS firma,
      (SELECT nombre FROM imagenes WHERE idusuarios = U.idusuarios AND idtipo_imagenes = 2) AS sello,
      U.create_at 
    FROM usuarios U 
    JOIN roles R ON U.idroles = R.idroles
    WHERE cedulas = ?
    LIMIT 1;
    `;
  const data_query = [password || authData?.odontologo.cedula];
  sendQueryDataBase(query, data_query)
    .then((response) => {

      if (response.length !== 0) {
        req.body.data = response;
        next();
      } else {
        res.status(403).send("El número de cedula es incorrecto");
      }
    })
    .catch((error) => {
      throw error;
    });
};

exports.get_login_lector = (req, res, next) => {
  const { username, password } = req.body;

  const query = `
    SELECT 
      U.idusuarios AS id, R.roles AS rol, U.cedulas AS cedula, U.codigo_col, U.nombres, U.apellidos, U.telefonos AS telefono,
      (SELECT nombre FROM imagenes WHERE idusuarios = U.idusuarios AND idtipo_imagenes = 1) AS firma,
      (SELECT nombre FROM imagenes WHERE idusuarios = U.idusuarios AND idtipo_imagenes = 2) AS sello,
      U.create_at 
    FROM usuarios U 
    JOIN roles R ON U.idroles = R.idroles
    WHERE cedulas = ? AND codigo_col = ?;
    `;

  const data_query = [username, password];

  sendQueryDataBase(query, data_query)
    .then((response) => {
      if (response.length === 0) {
        res.status(403).send("El número de cedula es incorrecto");
      } else {
        req.body.data = response;
        next();
      }
    })
    .catch((error) => {
      throw error;
    });
};

exports.get_prescripciones = (req, res, next) => {
  const { id } = req.authData.odontologo;

  const query =
    "SELECT idprescripciones AS id, cedulas, nombres, apellidos, create_at FROM prescripciones WHERE idusuarios = ? ORDER BY create_at DESC;";

  sendQueryDataBase(query, id)
    .then((response) => {
      req.body = { data: response };
      next();
    })
    .catch((error) => {
      throw error;
    });
};

exports.get_imagenes_productos = async (req, res, next) => {
  const { prescripcion } = req.body;

  let ids = "";

  for (let i = 0; i < prescripcion.productos.length; i++) {
    ids += "?,";
  }

  const query = `SELECT nombres, usos, imagen FROM productos WHERE idproductos IN (${ids.slice(0, -1)});`;
  const data_query = prescripcion.productos;

  sendQueryDataBase(query, data_query)
    .then((res) => {
      req.body.prescripcion.productos = res;
      next();
    })
    .catch((err) => {
      next(err);
    });
};

exports.get_lista_productos = async (req, res, next) => {
  const query = `
   SELECT P.idproductos AS id, C.categorias, T.tipos_productos AS tipo, P.nombres, P.usos, P.imagen
   FROM productos P
   JOIN categorias C ON P.idcategorias = C.idcategorias
   JOIN tipos_productos T ON P.idtipos_productos = T.idtipos_productos
   ORDER BY P.nombres ASC;
   `;
  sendQueryDataBase(query)
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      next(err);
    });
};

exports.get_prescripcion = async (req, res, next) => {
  const { id } = req.params;

  const query_prescripcion = `SELECT idusuarios, cedulas, nombres, apellidos, recomendaciones, create_at FROM prescripciones WHERE idprescripciones = ?;`;

  const prescripcion = await sendQueryDataBase(query_prescripcion, id)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      next(err);
    });

  if (prescripcion.length !== 0) {
    const pres = prescripcion[0];

    const query_productos = `
      SELECT P.idproductos AS id, C.categorias, T.tipos_productos AS tipo, P.nombres, P.imagen 
      FROM registro_productos RP 
      JOIN productos P ON RP.idproductos = P.idproductos
      JOIN categorias C ON P.idcategorias = C.idcategorias
      JOIN tipos_productos T ON P.idtipos_productos = T.idtipos_productos
      WHERE RP.idprescripciones = ?;
    `;

    const productos = await sendQueryDataBase(query_productos, id)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        next(err);
      });

    res.send({
      id,
      prescripcion: pres,
      productos,
    });

    next();
  } else {
    res.send(
      "El ID de la prescipción no se encuentra registrado en la base de datos"
    );
  }
};

exports.get_key_image = (req, res, next) => {
  const { odontologo } = req.authData;

  const query = `
   SELECT I.idimagenes, T.tipo_imagen, I.nombre 
   FROM imagenes I 
   JOIN tipo_imagenes T ON I.idtipo_imagenes = T.idtipo_imagenes
   WHERE I.idusuarios = ?;
   `;

  sendQueryDataBase(query, odontologo.id)
    .then((response) => {
      req.body.img_del = response;
      next();
    })
    .catch((err) => {
      next(err);
    });
};

exports.get_data_prescripcion = async (req, res, next) => {
  const { id } = req.params;

  const query = `SELECT cedulas AS cedula, nombres AS nombre, apellidos AS apellido, recomendaciones, create_at FROM prescripciones WHERE idprescripciones = ?;`;
  const query_productos = `SELECT idproductos FROM kagencia_prescripciones_2023.registro_productos where idprescripciones = ?;`;

  const { cedula, nombre, apellido, recomendaciones } = await sendQueryDataBase(query, [id])
    .then((res) => {
      return res[0];
    })
    .catch((err) => {
      next(err);
    });

  const get_productos = await sendQueryDataBase(query_productos, [id])
    .then((res) => {
      return res
    })
    .catch((err) => {
      next(err);
    });

  const productos = get_productos.map(item => item.idproductos);

  req.body = {
    paciente: {
      cedula,
      nombre,
      apellido
    },
    prescripcion: {
      id,
      productos,
      recomendaciones
    }
  }

  next();
}

exports.post_data_prescripcion = async (req, res, next) => {
  const { odontologo } = req.authData;

  const { paciente, prescripcion } = req.body;

  const query = `INSERT INTO prescripciones (idusuarios, cedulas, nombres, apellidos, recomendaciones) VALUES (?, ?, ?, ?, ?);`;

  const insert_data_prescripcion = await sendQueryDataBase(query, [
    odontologo.id,
    paciente.cedula,
    paciente.nombre,
    paciente.apellido,
    prescripcion.recomendaciones,
  ])
    .then((res) => {
      return res;
    })
    .catch((err) => {
      next(err);
    });

  for (let i = 0; i < prescripcion.productos.length; i++) {
    const query = `INSERT INTO registro_productos (idprescripciones, idproductos) VALUES (?, ?);`;
    await sendQueryDataBase(query, [
      insert_data_prescripcion.insertId,
      prescripcion.productos[i],
    ]).catch((err) => {
      next(err);
    });
  }

  req.body.prescripcion.id = insert_data_prescripcion.insertId;

  next();
};

const upload_db = ({ id, imagenes }) => {
  const promises = [];

  for (const property in imagenes) {
    const idtipo_imagenes = property === "firma" ? 1 : 2;
    const query = `INSERT INTO imagenes (idusuarios, idtipo_imagenes, nombre) VALUES (?, ?, ?)`;
    const data_query = [id, idtipo_imagenes, imagenes[property].Key];

    promises.push(sendQueryDataBase(query, data_query));
  }

  return Promise.all(promises);
};

exports.put_data_user = async (req, res, next) => {
  const { id } = req.authData.odontologo;

  const { nombres, apellidos, telefono } = JSON.parse(req.body.data);
  console.log({ nombres, apellidos, telefono });
  const imagenes = req.aws;

  try {

    const query = `UPDATE usuarios SET nombres = ?, apellidos = ?, telefonos = ? WHERE (idusuarios = ?);`;
    const data_query = [nombres, apellidos, telefono, id];
    await sendQueryDataBase(query, data_query);

    for (const property in imagenes) {
      const idtipo_imagenes = property === "firma" ? 1 : 2;

      const query_select =
        "SELECT CASE WHEN idimagenes IS NOT NULL THEN true END AS existe FROM imagenes WHERE idusuarios = ? AND idtipo_imagenes = ?;";

      const existe = await sendQueryDataBase(query_select, [
        id,
        idtipo_imagenes,
      ]).then((response) => {
        return response;
      });

      let query;
      let data_query = [];
      const { Key } = imagenes[property];

      if (existe.length !== 0) {
        query = `UPDATE imagenes SET nombre = ? WHERE (idusuarios = ? AND idtipo_imagenes = ?);`;
        data_query = [Key, id, idtipo_imagenes];
      } else {
        query = `INSERT INTO imagenes (idusuarios, idtipo_imagenes, nombre) VALUES (?, ?, ?)`;
        data_query = [id, idtipo_imagenes, Key];
      }

      await sendQueryDataBase(query, data_query);
    }

    next();

    // res.send("La información se ha añadido correctamente");
  } catch (err) {
    next(err);
  }
};

exports.put_imagen_firma_sello = async (req, res, next) => {
  const { id } = req.authData.odontologo;
  const imagenes = req.aws;

  try {
    for (const property in imagenes) {
      const idtipo_imagenes = property === "firma" ? 1 : 2;

      const query_select =
        "SELECT CASE WHEN idimagenes IS NOT NULL THEN true END AS existe FROM imagenes WHERE idusuarios = ? AND idtipo_imagenes = ?;";
      const existe = await sendQueryDataBase(query_select, [
        id,
        idtipo_imagenes,
      ]).then((response) => {
        return response;
      });

      let query;
      let data_query = [];
      const { Key } = imagenes[property];

      if (existe.length !== 0) {
        query = `UPDATE imagenes SET nombre = ? WHERE (idusuarios = ? AND idtipo_imagenes = ?);`;
        data_query = [Key, id, idtipo_imagenes];
      } else {
        query = `INSERT INTO imagenes (idusuarios, idtipo_imagenes, nombre) VALUES (?, ?, ?)`;
        data_query = [id, idtipo_imagenes, Key];
      }

      await sendQueryDataBase(query, data_query);
    }
    res.send("Los archivos se han añadido correctamente");
    next();
  } catch (err) {
    next(err);
  }
};
