const multer = require("multer");
const sharp = require("sharp");
const bycrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middleware/uploadimageMiddleware");
const User = require("../models/userModel");
const createToken = require("../utils/createToken");

exports.uploadUserImage = uploadSingleImage("profileImg");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // save image in data base
    req.body.profileImg = filename;
  }

  next();
});
// @desc get list of users
// @route Get /api/v1/users
// @access Private
exports.getUsers = factory.getAll(User);
// @desc Get specific user by id
// @route get /api/v1/users/:id
// @access Private
exports.getUser = factory.getOne(User);
// @desc create users
// @route Post /api/v1/users
// @access Private
exports.createUser = factory.createOne(User);
// @desc Update specific users
// @route PUT /api/v1/users/:id
// @access Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      slug: req.body.slug,
      email: req.body.email,
      role: req.body.role,
      profileImg: req.body.profileImg,
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No document for this id: ${req.params.id}`, 404));
  }
  res.status(201).json({ data: document });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bycrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No document for this id: ${req.params.id}`, 404));
  }
  res.status(201).json({ data: document });
});
// @desc Delete specific users
// @route DEL /api/v1/users/:id
// @access Private
exports.deleteUser = factory.deleteOne(User);
// @desc Get Logged user data
// @route get /api/v1/users/getMe
// @access Private/protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});
// @desc Update Logged user password
// @route get /api/v1/users/updateMyPassword
// @access Private/protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1- update user password based user payload (req.user._id)
  const document = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bycrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  // 2- generate token
  const token = createToken(req.user._id);
  res.status(200).json({ data: req.user, token });
});
// @desc Update Logged user data(without password)
// @route get /api/v1/users/updateMyPassword
// @access Private/protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
    },
    {
      new: true,
    }
  );
  res.status(200).json({ data: updateUser });
});
// @desc Deactive logged user data
// @route DELETE /api/v1/users/deleteMe
// @access Private/protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "Success" });
});
