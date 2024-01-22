const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const Review = require("../models/reviewModel");

// nested route
// Get /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { category: req.params.productId };
  req.filterObj = filterObject;
  next();
};
// @desc get list of reviews
// @route Get /api/v1/reviews
// @access Public
exports.getReviews = factory.getAll(Review);
// @desc Get specific Review by id
// @route get /api/v1/reviews/:id
// @access Public
exports.getReview = factory.getOne(Review);
// Nested Route (create)
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
// @desc create reviews
// @route Post /api/v1/reviews
// @access Private/protect/user
exports.createReview = factory.createOne(Review);
// @desc Update specific reviews
// @route PUT /api/v1/reviews/:id
// @access Private/protect/user
exports.updateReview = factory.updateOne(Review);
// @desc Delete specific reviews
// @route DEL /api/v1/reviews/:id
// @access Private/protect/user-admin-manager
exports.deleteReview = factory.deleteOne(Review);
