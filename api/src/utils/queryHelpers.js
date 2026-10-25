const AppError = require('./AppError');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const invalidQuery = (details) =>
  new AppError(400, 'INVALID_QUERY', 'Paràmetres de consulta no vàlids', details);

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePagination = (query) => {
  const details = [];

  const read = (field, fallback) => {
    const value = query[field];
    if (value === undefined) return fallback;
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
      details.push({ field, message: 'Ha de ser un enter positiu' });
      return fallback;
    }
    return Number(value);
  };

  const page = read('page', 1);
  const requestedLimit = read('limit', DEFAULT_LIMIT);

  if (details.length > 0) throw invalidQuery(details);

  const limit = Math.min(requestedLimit, MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
};

const parseSort = (value, allowedFields, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || value.length === 0) {
    throw invalidQuery([{ field: 'sort', message: 'Valor no vàlid' }]);
  }
  const fields = value.split(',');
  const invalid = fields.filter((field) => !allowedFields.includes(field.replace(/^-/, '')));
  if (invalid.length > 0) {
    throw invalidQuery([
      { field: 'sort', message: `Camps permesos: ${allowedFields.join(', ')}` }
    ]);
  }
  return fields.join(' ');
};

const parseBoolean = (value, field) => {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw invalidQuery([{ field, message: 'Ha de ser true o false' }]);
};

const parseNameFilter = (value) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.trim() === '') {
    throw invalidQuery([{ field: 'name', message: 'Valor no vàlid' }]);
  }
  return new RegExp(escapeRegex(value.trim()), 'i');
};

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit)
});

module.exports = {
  parsePagination,
  parseSort,
  parseBoolean,
  parseNameFilter,
  buildPagination
};
