const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

// @desc Get all users
// @Route  GET /api/v1/auth/users
// @access private/Admin

exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc Get single user
// @Route  GET /api/v1/auth/users/:id
// @access private/Admin

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Create user
// @Route  POST /api/v1/auth/users
// @access private/Admin

exports.createUsers = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc Update user
// @Route  PUT /api/v1/auth/users/:id
// @access private/Admin

exports.updateUsers = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Delete user
// @Route  DELETE /api/v1/auth/users/:id
// @access private/Admin

exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {},
  });
});
