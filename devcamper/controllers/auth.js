const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

// @desc Register User
// @Route  POST /api/v1/auth/register
// @access public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //   Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  //   Create token
  // This is a method call and its called on the actual user that we get after creating
  sendTokenResponse(user, 200, res);
});

// @desc Login User
// @Route  POST /api/v1/auth/login
// @access public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //   Validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide and email and password", 400)
    );
  }
  //   Check for user
  // +password because we don't send back password by default
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  //   Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  //   Create token

  sendTokenResponse(user, 200, res);
});

// @desc Get current logged in User
// @Route  POST /api/v1/auth/me
// @access private

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc   Logout
// @Route  POST /api/v1/auth/logout
// @access private

exports.logOut = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc Update user details
// @Route  PUT /api/v1/auth/updatedetails
// @access private

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Update password
// @Route  PUT /api/v1/auth/updatepassword
// @access private

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc  Forgot password
// @Route  POST /api/v1/auth/forgotPassword
// @access public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse(`No user found with that email`, 404));
  }
  // Get reset token
  const resetToken = user.getResetPasswordToken();
  user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    data: user,
  });
});

// Get token from the model and create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // create token
  // This is a method call and its called on the actual user that we get after creating
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production ") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
