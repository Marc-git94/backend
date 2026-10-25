const Producte = require('../models/Producte');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');

const notFound = () => new AppError(404, 'PRODUCT_NOT_FOUND', 'Producte no trobat');

const ensureCategoryExists = async (categoryId) => {
  if (categoryId === undefined || categoryId === null) return;
  const exists = await Category.exists({ _id: categoryId });
  if (!exists) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Les dades no són vàlides', [
      { field: 'category', message: 'La categoria no existeix' }
    ]);
  }
};

const createProduct = async (data) => {
  await ensureCategoryExists(data.category);
  const product = new Producte(data);
  await product.save();
  return await product.populate('category', 'name slug');
};

const getAllProducts = async () => {
  return await Producte.find().populate('category', 'name slug');
};

const getProductById = async (id) => {
  const product = await Producte.findById(id).populate('category', 'name slug');
  if (!product) throw notFound();
  return product;
};

const updateProduct = async (id, data) => {
  await ensureCategoryExists(data.category);
  const product = await Producte.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true
  }).populate('category', 'name slug');
  if (!product) throw notFound();
  return product;
};

const deleteProduct = async (id) => {
  const product = await Producte.findByIdAndDelete(id);
  if (!product) throw notFound();
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
