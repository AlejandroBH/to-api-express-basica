const fs = require("fs");

function guardar(file, value) {
  try {
    fs.appendFileSync(file, value);
  } catch (error) {
    console.error("Error al guardar archivo:", error.message);
  }
}

module.exports = guardar;
