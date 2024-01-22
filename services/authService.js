const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");

const User = require("../models/userModel");

// @desc   signup
// @route  Post /api/v1/auth/signup
// @access Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1-create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  // 2-generate token
  const token = createToken(user._id);
  res.status(201).json({ data: user, token });
});
// @desc   login
// @route  Post /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1- check if email and password in the body (validation)
  // 2- check if user exit & check if password is correct
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect E-mail or Password"));
  }
  // 3- generate token
  const token = createToken(user._id);
  // 4- send response
  res.status(200).json({ data: user, token });
});
// @desc make sure that user login
exports.protect = asyncHandler(async (req, res, next) => {
  // 1-check if token exist,if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = await req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, Please login to get access this route",
        401
      )
    );
  }
  // 2-verify token (no change happens, expired token )
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded);
  // 3-check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "the User that belong to this token does no longer exist",
        401
      )
    );
  }
  // 4-check if user change password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // password changed after token created(Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError("user recently changed his password. please login again")
      );
    }
  }
  req.user = currentUser;
  next();
});
// @desc Authorization (User Permissions)
// ["admin","manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1- access roles
    // 2- access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not Allowed to access this route", 403)
      );
    }
    next();
  });
// @desc   Forgot password
// @route  Post /api/v1/auth/forgotPassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("There is no user with that email", 404));
  }
  // if user exist , generate random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random * 900000).toString();

  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // save hased password reset code in db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code(10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();
  // send the reset code via email
  const message = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-shop Team`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("there is an error in sending email", 500));
  }
  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});
// @desc   Verify password reset code
// @route  Post /api/v1/auth/verifyResetCode
// @access Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1- Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expire"));
  }

  // 2-Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: "Success" });
});
// @desc   Reset password
// @route  PUT /api/v1/auth/resetPassword
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1-Get user based on password
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no password for this ${req.body.email}`, 404)
    );
  }
  // 2- check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset cod not verified", 400));
  }
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();
  // 3) if everything is ok, generate token
  const token = createToken(user._id);
  res.status(200).json({ token });
});
