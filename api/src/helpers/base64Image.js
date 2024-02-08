const fs = require('fs');

exports.base64Image = async (filePath, type = 'png') => {

  const result = fs.readFileSync(filePath, {
    encoding: 'base64',
  });

  return `data:image/${type};base64,${result}`;

};