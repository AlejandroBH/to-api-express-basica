const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "../logs", "api.log");

function logging(metodo, ruta, estado, mensaje) {
  console.log(metodo);

  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${metodo} ${ruta} - ${estado} | ${mensaje}\n`;

  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error("Error al escribir en el log:", error.message);
  }
}

module.exports = logging;
