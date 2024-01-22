const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const { uploadMixOfImages } = require("../middleware/uploadimageMiddleware");
const ApiError = require("../utils/apiError");
const Product = require("../models/productModel");
const factory = require("./handlersFactory");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // 1- image processing for imageCover
  const imageCoverFilename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
  if (req.files.imageCover) {
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFilename}`);

    // save image in data base
    req.body.imageCover = imageCoverFilename;
  }
  // 2- image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        // save image in data base
        req.body.images.push(imageName);
      })
    );
  }
  next();
});
// @desc get list of products
// @route Get /api/v1/products
// @access Public
exports.getProducts = factory.getAll(Product, "Products");
// @desc Get specific product by id
// @route get /api/v1/products/:id
// @access Public
exports.getProduct = factory.getOne(Product, "reviews");
// @desc create product
// @route Post /api/v1/products
// @access Private
exports.createProduct = factory.createOne(Product);
// @desc Update specific product
// @route PUT /api/v1/products/:id
// @access Private
exports.updateProduct = factory.updateOne(Product);
// @desc Delete specific product
// @route DEL /api/v1/products/:id
// @access Private
exports.deleteProduct = factory.deleteOne(Product);
