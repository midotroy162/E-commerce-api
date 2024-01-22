const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const CategoryModel = require("../models/categoryModel");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middleware/uploadimageMiddleware");
// 1- disk storage engine
// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/categories");
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split("/")[1];
//     const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
//     cb(null, filename);
//   },
// });

// 2- memory storage engine
// const multerStorage = multer.memoryStorage();

// const multerFilter = function (req, file, cb) {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new ApiError("Only image allowed", 400), false);
//   }
// };

// const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadCategoryImage = uploadSingleImage("image");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/categories/${filename}`);
    req.body.image = filename;
  }
  // save image in data base

  next();
});

// @desc get list of categories
// @route Get /api/v1/categories
// @access Public
exports.getCategories = factory.getAll(CategoryModel);
// @desc Get specific category by id
// @route get /api/v1/categories/:id
// @access Public
exports.getCategory = factory.getOne(CategoryModel);
// @desc create categories
// @route Post /api/v1/categories
// @access Private
exports.createCategory = factory.createOne(CategoryModel);
// @desc Update specific categories
// @route PUT /api/v1/categories/:id
// @access Private
exports.updateCategory = factory.updateOne(CategoryModel);
// @desc Delete specific categories
// @route DEL /api/v1/categories/:id
// @access Private
exports.deleteCategory = factory.deleteOne(CategoryModel);
