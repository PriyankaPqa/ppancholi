const fs = require('fs');
const path = require('path');

const parameters = process.argv.slice(2);
const fileName = parameters[0];
const replace = parameters[1];
const replacement = parameters[2];
const filePath = path.resolve(__dirname, `../../apps/${fileName}`);

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  const regex = new RegExp(replace, 'g');
  const result = data.replace(regex, replacement);

  fs.writeFile(filePath, result, 'utf8', (err) => {
    if (err) {
      console.log(err);
    }
  });
});
