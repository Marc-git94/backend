const bcrypt = require('bcrypt');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const {
  parsePagination,
  parseSort,
  parseBoolean,
  parseNameFilter,
  buildPagination
} = require('../utils/queryHelpers');

const SALT_ROUNDS = 12;
const ALLOWED_FIELDS = ['name', 'email', 'password'];
const SORT_FIELDS = ['name', 'email', 'createdAt', 'updatedAt'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const notFound = () => new AppError(404, 'USER_NOT_FOUND', 'Usuari no trobat');

const validationError = (details) =>
  new AppError(422, 'VALIDATION_ERROR', 'Les dades no són vàlides', details);

const checkAllowedFields = (data) => {
  const forbidden = Object.keys(data).filter((key) => !ALLOWED_FIELDS.includes(key));
  if (forbidden.length > 0) {
    throw validationError(forbidden.map((field) => ({ field, message: 'Camp no permès' })));
  }
};

const validateUserData = (data, requireAll) => {
  const details = [];

  if (requireAll || data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length < 2) {
      details.push({ field: 'name', message: 'El nom és obligatori (mínim 2 caràcters)' });
    }
  }

  if (requireAll || data.email !== undefined) {
    if (typeof data.email !== 'string' || !EMAIL_REGEX.test(data.email.trim())) {
      details.push({ field: 'email', message: 'Format incorrecte' });
    }
  }

  if (requireAll || data.password !== undefined) {
    if (typeof data.password !== 'string' || data.password.length < 12) {
      details.push({ field: 'password', message: 'La contrasenya ha de tenir mínim 12 caràcters' });
    } else if (Buffer.byteLength(data.password) > 72) {
      details.push({ field: 'password', message: 'La contrasenya pot tenir com a màxim 72 bytes' });
    }
  }

  if (details.length > 0) throw validationError(details);
};

const createUser = async (data) => {
  checkAllowedFields(data);
  validateUserData(data, true);

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = new User({
    name: data.name.trim(),
    email: data.email.trim(),
    passwordHash,
    role: 'client'
  });
  return await user.save();
};

const getUsers = async (query) => {
  const filter = {};
  const active = parseBoolean(query.active, 'active');
  const name = parseNameFilter(query.name);
  if (active !== undefined) filter.active = active;
  if (name) filter.name = name;

  const sort = parseSort(query.sort, SORT_FIELDS, '-createdAt');
  const { page, limit, skip } = parsePagination(query);

  const [data, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  return { data, pagination: buildPagination(page, limit, total) };
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw notFound();
  return user;
};

const updateUser = async (id, data) => {
  checkAllowedFields(data);
  validateUserData(data, false);

  const changes = {};
  if (data.name !== undefined) changes.name = data.name.trim();
  if (data.email !== undefined) changes.email = data.email.trim().toLowerCase();
  if (data.password !== undefined) {
    changes.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  const user = await User.findByIdAndUpdate(id, changes, {
    returnDocument: 'after',
    runValidators: true
  });
  if (!user) throw notFound();
  return user;
};

const deactivateUser = async (id) => {
  const user = await User.findByIdAndUpdate(id, { active: false }, { returnDocument: 'after' });
  if (!user) throw notFound();
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser
};
