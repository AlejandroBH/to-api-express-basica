// servidor-express-completo.js
const express = require("express");

const validar = require("./helpers/validar.helper.js");
const logOperacion = require("./helpers/logging.helper.js");
const { tareaSchema, tareaPatchSchema } = require("./schemas/tarea.schemas.js");

// Crear aplicación Express
const app = express();

// Middleware para parsing JSON
app.use(express.json());

// Base de datos simulada
let tareas = [
  {
    id: 1,
    titulo: "Aprender Express",
    descripcion: "Completar tutorial",
    completada: false,
  },
  {
    id: 2,
    titulo: "Crear API",
    descripcion: "Implementar endpoints REST",
    completada: true,
  },
  {
    id: 3,
    titulo: "Testing",
    descripcion: "Probar con Postman",
    completada: false,
  },
];

let siguienteId = 4;

// Funciones helper
function encontrarTarea(id) {
  return tareas.find((t) => t.id === parseInt(id));
}

// Rutas de la API

// GET / - Información de la API
app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Gestión de Tareas con Express.js",
    version: "1.0.0",
    endpoints: {
      "GET /": "Esta información",
      "GET /tareas": "Listar tareas",
      "GET /tareas/:id": "Obtener tarea específica",
      "POST /tareas": "Crear nueva tarea",
      "PUT /tareas/:id": "Actualizar tarea completa",
      "PATCH /tareas/:id": "Actualizar tarea parcial",
      "DELETE /tareas/:id": "Eliminar tarea",
      "GET /estadisticas": "Conteo de tareas por estado",
    },
    ejemplos: {
      crear:
        'POST /tareas con body: {"titulo": "Mi tarea", "descripcion": "Descripción"}',
      filtrar: "GET /tareas?completada=false",
      buscar: "GET /tareas?q=express",
      estadisticas: "GET /estadisticas",
    },
  });
});

// GET /estadisticas - Conteo de tareas por estado
app.get("/estadisticas", (req, res) => {
  const total = tareas.length;
  const completadas = tareas.filter((t) => t.completada).length;
  const pendientes = total - completadas;

  res.json({
    total,
    completadas,
    pendientes,
    porcentajeCompletadas: total > 0 ? (completadas / total) * 100 : 0,
  });
});

// GET /tareas - Listar todas las tareas
app.get("/tareas", (req, res) => {
  let resultados = [...tareas];
  const { completada, q, ordenar } = req.query;

  // Filtrar por estado
  if (completada !== undefined) {
    const filtroCompletada = completada === "true";
    resultados = resultados.filter((t) => t.completada === filtroCompletada);
  }

  // Buscar por texto
  if (q) {
    const termino = q.toLowerCase();
    resultados = resultados.filter(
      (t) =>
        t.titulo.toLowerCase().includes(termino) ||
        t.descripcion.toLowerCase().includes(termino)
    );
  }

  // Ordenar
  if (ordenar === "titulo") {
    resultados.sort((a, b) => a.titulo.localeCompare(b.titulo));
  } else if (ordenar === "fecha") {
    // Simular orden por fecha (en una BD real tendríamos created_at)
    resultados.reverse();
  }

  // LOG
  logOperacion(
    req.method,
    req.originalUrl,
    res.statusCode,
    `Listando ${resultados.length} tareas (Filtros: ${JSON.stringify(
      req.query
    )})`
  );

  res.json({
    total: resultados.length,
    tareas: resultados,
    filtros: req.query,
  });
});

// GET /tareas/:id - Obtener tarea específica
app.get("/tareas/:id", (req, res) => {
  const tarea = encontrarTarea(req.params.id);

  if (!tarea) {
    // LOG
    logOperacion(
      req.method,
      req.originalUrl,
      404,
      `Fallo en Lectura - Tarea ID ${req.params.id} no encontrada`
    );
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  // LOG
  logOperacion(
    req.method,
    req.originalUrl,
    res.statusCode,
    `Lectura exitosa de Tarea ID ${tarea.id} (${tarea.titulo})`
  );

  res.json(tarea);
});

// POST /tareas - Crear nueva tarea
app.post("/tareas", validar(tareaSchema), (req, res) => {
  const nuevaTarea = {
    id: siguienteId++,
    titulo: req.body.titulo,
    descripcion: req.body.descripcion || "",
    completada: false,
    fechaCreacion: new Date().toISOString(),
  };

  tareas.push(nuevaTarea);

  // LOG
  logOperacion(
    req.method,
    req.originalUrl,
    201,
    `Creación exitosa: Tarea ID ${nuevaTarea.id} (${nuevaTarea.titulo})`
  );

  res.status(201).json({
    mensaje: "Tarea creada exitosamente",
    tarea: nuevaTarea,
  });
});

// PUT /tareas/:id - Actualizar tarea completa
app.put("/tareas/:id", validar(tareaSchema), (req, res) => {
  const tarea = encontrarTarea(req.params.id);

  if (!tarea) {
    // LOG
    logOperacion(
      req.method,
      req.originalUrl,
      404,
      `Fallo en Actualización (PUT) - Tarea ID ${req.params.id} no encontrada`
    );

    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  tarea.titulo = req.body.titulo;
  tarea.descripcion = req.body.descripcion || "";
  tarea.completada =
    req.body.completada !== undefined ? req.body.completada : false;
  tarea.fechaActualizacion = new Date().toISOString();

  // LOG
  logOperacion(
    req.method,
    req.originalUrl,
    200,
    `Actualización (PUT) exitosa de Tarea ID ${tarea.id} (${tarea.titulo})`
  );

  res.json({
    mensaje: "Tarea actualizada completamente",
    tarea,
  });
});

// PATCH /tareas/:id - Actualizar tarea parcial
app.patch("/tareas/:id", validar(tareaPatchSchema), (req, res) => {
  const tarea = encontrarTarea(req.params.id);

  if (!tarea) {
    // LOG
    logOperacion(
      req.method,
      req.originalUrl,
      404,
      `Fallo en Actualización (PATCH) - Tarea ID ${req.params.id} no encontrada`
    );

    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  const body = req.body;

  if (body.titulo !== undefined) {
    tarea.titulo = body.titulo;
  }

  if (body.descripcion !== undefined) {
    tarea.descripcion = body.descripcion;
  }

  if (body.completada !== undefined) {
    tarea.completada = body.completada;
  }

  tarea.fechaActualizacion = new Date().toISOString();

  // LOG
  logOperacion(
    req.method,
    req.originalUrl,
    200,
    `Actualización (PATCH) parcial de Tarea ID ${tarea.id} - Campos: [${camposActualizados}]`
  );

  res.json({
    mensaje: "Tarea actualizada parcialmente",
    tarea,
  });
});

// DELETE /tareas/:id - Eliminar tarea
app.delete("/tareas/:id", (req, res) => {
  const indice = tareas.findIndex((t) => t.id === parseInt(req.params.id));

  if (indice === -1) {
    // LOG
    logOperacion(
      req.method,
      req.originalUrl,
      404,
      `Fallo en Eliminación - Tarea ID ${req.params.id} no encontrada`
    );

    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  const tareaEliminada = tareas.splice(indice, 1)[0];

  // LOG
  logOperacion(
    req.method,
    req.originalUrl,
    200,
    `Eliminación exitosa: Tarea ID ${tareaEliminada.id} (${tareaEliminada.titulo})`
  );

  res.json({
    mensaje: "Tarea eliminada exitosamente",
    tarea: tareaEliminada,
  });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error("Error:", error);

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido" });
  }

  // LOG
  logOperacion(
    req.method,
    req.originalUrl,
    500,
    `Error Interno: ${error.message}`
  );

  res.status(500).json({
    error: "Error interno del servidor",
    mensaje:
      process.env.NODE_ENV === "development" ? error.message : "Algo salió mal",
  });
});

// Middleware 404
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    metodo: req.method,
    ruta: req.url,
    sugerencias: [
      "GET / - Información de la API",
      "GET /tareas - Listar tareas",
      "POST /tareas - Crear tarea",
    ],
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `🚀 API REST con Express.js ejecutándose en http://localhost:${PORT}`
  );
  console.log(`📖 Documentación en http://localhost:${PORT}`);
  console.log(`🧪 Prueba los endpoints con curl o Postman`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Cerrando servidor...");
  process.exit(0);
});
