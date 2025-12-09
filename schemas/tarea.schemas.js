// tarea.schemas.js
const Joi = require("joi");

// Esquema Base para la creación (POST) o actualización completa (PUT)
const tareaSchema = Joi.object({
  titulo: Joi.string().min(3).required().messages({
    "any.required": "El título es obligatorio",
    "string.empty": "El título no debe estar vacío",
    "string.min": "El título debe tener al menos 3 caracteres",
    "string.base": "El título debe ser texto",
  }),
  descripcion: Joi.string().allow("").optional().messages({
    "string.base": "La descripción debe ser texto",
  }),
  completada: Joi.boolean().optional().messages({
    "boolean.base": "El estado completada debe ser un booleano",
  }),
});

// Esquema para la actualización parcial (PATCH)
const tareaPatchSchema = Joi.object({
  titulo: Joi.string().min(3).optional().messages({
    "string.min": "El título debe tener al menos 3 caracteres",
    "string.base": "El título debe ser texto",
  }),
  descripcion: Joi.string().allow("").optional().messages({
    "string.base": "La descripción debe ser texto",
  }),
  completada: Joi.boolean().optional().messages({
    "boolean.base": "El estado completada debe ser un booleano",
  }),
})
  .min(1)
  .messages({
    "object.min":
      "Debe proporcionar al menos un campo para actualizar: titulo, descripcion o completada.",
  });

module.exports = {
  tareaSchema,
  tareaPatchSchema,
};
