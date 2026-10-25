const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const {
  parsePagination,
  parseSort,
  parseBoolean,
  parseNameFilter,
  buildPagination
} = require('../utils/queryHelpers');

const ALLOWED_FIELDS = ['name', 'slug', 'description', 'active'];
const SORT_FIELDS = ['name', 'slug', 'createdAt', 'updatedAt'];

const notFound = () => new AppError(404, 'CATEGORY_NOT_FOUND', 'Categoria no trobada');

const pickFields = (data) =>
  Object.fromEntries(
    ALLOWED_FIELDS.filter((field) => data[field] !== undefined).map((field) => [
      field,
      data[field]
    ])
  );

const createCategory = async (data) => {
  const category = new Category(pickFields(data));
  return await category.save();
};

const getCategories = async (query) => {
  const filter = {};
  const active = parseBoolean(query.active, 'active');
  const name = parseNameFilter(query.name);
  if (active !== undefined) filter.active = active;
  if (name) filter.name = name;

  const sort = parseSort(query.sort, SORT_FIELDS, 'name');
  const { page, limit, skip } = parsePagination(query);

  const [data, total] = await Promise.all([
    Category.find(filter).sort(sort).skip(skip).limit(limit),
    Category.countDocuments(filter)
  ]);

  return { data, pagination: buildPagination(page, limit, total) };
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw notFound();
  return category;
};

const updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, pickFields(data), {
    returnDocument: 'after',
    runValidators: true
  });
  if (!category) throw notFound();
  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw notFound();
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
