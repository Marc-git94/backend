const Producte = require('../models/Producte');

const createProduct = async (productData) => {
  const newProduct = new Producte(productData);
  return await newProduct.save();
};

const getAllProducts = async () => {
  return await Producte.find();
};

const getProductById = async (id) => {
  return await Producte.findById(id);
};

const updateProduct = async (id, productData) => {
  return await Producte.findByIdAndUpdate(id, productData, {
    new: true,
    runValidators: true
  });
};

const deleteProduct = async (id) => {
  return await Producte.findByIdAndDelete(id);
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
