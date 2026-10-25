const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.query);
  res.status(200).json({ success: true, ...result });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({ success: true, data: user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json({ success: true, data: user });
});

const deactivateUser = asyncHandler(async (req, res) => {
  await userService.deactivateUser(req.params.id);
  res.status(204).send();
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser
};
