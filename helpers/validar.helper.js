function validar(esquema) {
  return (req, res, next) => {
    const { error, value } = esquema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      const detalles = error.details.map((d) => d.message);

      return res.status(400).json({
        error: "Datos de entrada inválidos",
        detalles: detalles,
      });
    }

    req.body = value;
    next();
  };
}

module.exports = validar;
