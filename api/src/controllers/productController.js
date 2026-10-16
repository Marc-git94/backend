const productService = require('../services/productService');

const handleError = (res, error) => {
  if (error.name === 'CastError' && error.path === '_id') {
    return res.status(400).json({ status: 'error', message: 'ID no vàlid' });
  }
  if (error.name === 'CastError' || error.name === 'ValidationError') {
    return res.status(400).json({ status: 'error', message: error.message });
  }
  res.status(500).json({ status: 'error', message: error.message });
};

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ status: 'success', data: product });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: products
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producte no trobat' });
    }
    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    handleError(res, error);
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producte no trobat' });
    }
    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producte no trobat' });
    }
    res.status(200).json({ status: 'success', message: 'Producte eliminat correctament' });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
