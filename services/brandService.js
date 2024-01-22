const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middleware/uploadimageMiddleware");
const Brand = require("../models/brandModel");

exports.uploadBrandImage = uploadSingleImage("image");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/brands/${filename}`);

  // save image in data base
  req.body.image = filename;

  next();
});
// @desc get list of brands
// @route Get /api/v1/brands
// @access Public
exports.getBrands = factory.getAll(Brand);
// @desc Get specific Brand by id
// @route get /api/v1/brands/:id
// @access Public
exports.getBrand = factory.getOne(Brand);
// @desc create brands
// @route Post /api/v1/brands
// @access Private
exports.createBrand = factory.createOne(Brand);
// @desc Update specific brands
// @route PUT /api/v1/brands/:id
// @access Private
exports.updateBrand = factory.updateOne(Brand);
// @desc Delete specific brands
// @route DEL /api/v1/brands/:id
// @access Private
exports.deleteBrand = factory.deleteOne(Brand);
