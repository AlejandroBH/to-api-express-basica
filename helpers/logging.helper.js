const fs = require("fs");
const path = require("path");
const guardar = require("./guardar.helper");

const LOG_FILE = path.join(__dirname, "../logs", "api.log");

function logging(metodo, ruta, estado, mensaje) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${metodo} ${ruta} - ${estado} | ${mensaje}\n`;

  guardar(LOG_FILE, logMessage);
}

module.exports = logging;
