const { base64Image } = require("./base64Image");

exports.buildHTML = async ({productos}) => {

   let arrProductos = [];
   let html = '';

   await productos.forEach(async data => {
      // let imagen = `http://192.168.1.29:3011/api/img?key=${data.imagen}`;
      let imagen = await base64Image(data.imagen);
      let table = `
         <td>
            <div class="productos">
               <table>
                  <tbody>
                     <tr>
                        <td>
                           <div class="imagen-productos">
                              <img class="imagenProducto"
                                 src="${imagen}" />
                           </div>
                        </td>
                        <td>
                           <div class="informacion-productos">
                              <h3 class="titulo-informacion">${data.nombres}</h3>
                              <p class="descripcion-informacion">${data.usos}</p>
                           </div>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </td>
      `

      arrProductos.push(table)
   });

   for (let i = 0; i < arrProductos.length; i++) {

      let code = '';
      if (i % 2 === 0) {
         code += ('<tr>' + arrProductos[i])

         if ((i + 1) === arrProductos.length) {
            code += '</tr>'
         }
      } else {
         code += (arrProductos[i] + '</tr>')
      }

      html += code;
   }

   return html;
}