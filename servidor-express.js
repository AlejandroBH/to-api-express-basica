// servidor-express-completo.js
const express = require("express");

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

function validarTarea(datos) {
  const errores = [];

  if (!datos.titulo || typeof datos.titulo !== "string") {
    errores.push("El título es requerido y debe ser texto");
  }

  if (datos.titulo && datos.titulo.length < 3) {
    errores.push("El título debe tener al menos 3 caracteres");
  }

  if (datos.descripcion && typeof datos.descripcion !== "string") {
    errores.push("La descripción debe ser texto");
  }

  return errores;
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
    },
    ejemplos: {
      crear:
        'POST /tareas con body: {"titulo": "Mi tarea", "descripcion": "Descripción"}',
      filtrar: "GET /tareas?completada=false",
      buscar: "GET /tareas?q=express",
    },
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
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  res.json(tarea);
});

// POST /tareas - Crear nueva tarea
app.post("/tareas", (req, res) => {
  const errores = validarTarea(req.body);

  if (errores.length > 0) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: errores,
    });
  }

  const nuevaTarea = {
    id: siguienteId++,
    titulo: req.body.titulo,
    descripcion: req.body.descripcion || "",
    completada: false,
    fechaCreacion: new Date().toISOString(),
  };

  tareas.push(nuevaTarea);

  res.status(201).json({
    mensaje: "Tarea creada exitosamente",
    tarea: nuevaTarea,
  });
});

// PUT /tareas/:id - Actualizar tarea completa
app.put("/tareas/:id", (req, res) => {
  const tarea = encontrarTarea(req.params.id);

  if (!tarea) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  const errores = validarTarea(req.body);

  if (errores.length > 0) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: errores,
    });
  }

  // Actualización completa
  tarea.titulo = req.body.titulo;
  tarea.descripcion = req.body.descripcion || "";
  tarea.completada = req.body.completada || false;
  tarea.fechaActualizacion = new Date().toISOString();

  res.json({
    mensaje: "Tarea actualizada completamente",
    tarea,
  });
});

// PATCH /tareas/:id - Actualizar tarea parcial
app.patch("/tareas/:id", (req, res) => {
  const tarea = encontrarTarea(req.params.id);

  if (!tarea) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  // Validación parcial (solo campos proporcionados)
  if (req.body.titulo !== undefined) {
    if (typeof req.body.titulo !== "string" || req.body.titulo.length < 3) {
      return res.status(400).json({ error: "Título inválido" });
    }
    tarea.titulo = req.body.titulo;
  }

  if (req.body.descripcion !== undefined) {
    if (
      req.body.descripcion !== null &&
      typeof req.body.descripcion !== "string"
    ) {
      return res.status(400).json({ error: "Descripción inválida" });
    }
    tarea.descripcion = req.body.descripcion || "";
  }

  if (req.body.completada !== undefined) {
    if (typeof req.body.completada !== "boolean") {
      return res
        .status(400)
        .json({ error: "Estado de completada debe ser boolean" });
    }
    tarea.completada = req.body.completada;
  }

  tarea.fechaActualizacion = new Date().toISOString();

  res.json({
    mensaje: "Tarea actualizada parcialmente",
    tarea,
  });
});

// DELETE /tareas/:id - Eliminar tarea
app.delete("/tareas/:id", (req, res) => {
  const indice = tareas.findIndex((t) => t.id === parseInt(req.params.id));

  if (indice === -1) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  const tareaEliminada = tareas.splice(indice, 1)[0];

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
