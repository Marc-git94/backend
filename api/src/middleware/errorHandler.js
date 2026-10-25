const AppError = require('../utils/AppError');

const sendError = (res, status, code, message, details) => {
  const error = { code, message };
  if (details) error.details = details;
  return res.status(status).json({ success: false, error });
};

const notFoundHandler = (req, res) =>
  sendError(res, 404, 'ROUTE_NOT_FOUND', 'Ruta no trobada');

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.name === 'CastError' ? 'Valor no vàlid' : e.message
    }));
    return sendError(res, 422, 'VALIDATION_ERROR', 'Les dades no són vàlides', details);
  }

  if (err.name === 'CastError') {
    if (err.path === '_id') {
      return sendError(res, 400, 'INVALID_ID', 'ID no vàlid');
    }
    return sendError(res, 400, 'INVALID_DATA', 'Dades incorrectes', [
      { field: err.path, message: 'Tipus de dada incorrecte' }
    ]);
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || err.keyValue || {});
    return sendError(
      res,
      409,
      'DUPLICATE_KEY',
      'El valor ja existeix',
      fields.map((field) => ({ field, message: 'Valor duplicat' }))
    );
  }

  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'INVALID_JSON', 'El cos de la petició no és un JSON vàlid');
  }

  console.error(err);
  return sendError(res, 500, 'INTERNAL_ERROR', 'Error intern del servidor');
};

module.exports = { errorHandler, notFoundHandler };
