const mysql = require('mysql')
const dotenv = require('dotenv').config();

const pool = mysql.createPool({
   connectionLimit: 20,
   host: process.env.DDBB_HOST,
   user: process.env.DDBB_USER,
   password: process.env.DDBB_PASSWORD,
   database: 'kagencia_prescripciones_2023'
});

exports.sendQueryDataBase = async (query, data_query) => {

   return await new Promise((resolve, reject) => {

      pool.getConnection((err, connection) => {
         if (err) reject(err);

         connection.query(query, data_query, (err, results, fields) => {
            if (!err) {
               resolve(results);
            } else {
               reject(err);
            }
            connection.release();
         })
      })
   })
}