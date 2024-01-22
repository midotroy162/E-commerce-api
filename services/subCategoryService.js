const SubCategoryModel = require("../models/subCategoryModel");
const factory = require("./handlersFactory");
// Nested Route
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryid;
  next();
};

// @desc create subCategory
// @route Post /api/v1/subcategories
// @access Private
exports.createSubCategory = factory.createOne(SubCategoryModel);
// nested route
// Get /api/v1/Categories/:categoryid/subcategories
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryid) filterObject = { category: req.params.categoryid };
  req.filterObj = filterObject;
  next();
};
// @desc get list of subCategories
// @route Get /api/v1/subCategories
// @access Public
exports.getSubCategories = factory.getAll(SubCategoryModel);
// @desc Get specific sub Category by id
// @route get /api/v1/subcategories/:id
// @access Public
exports.getSubCategory = factory.getOne(SubCategoryModel);
// @desc Update specific subcategories
// @route PUT /api/v1/subcategories/:id
// @access Private
exports.updateSubCategory = factory.updateOne(SubCategoryModel);
// @desc Delete specific subcategories
// @route DEL /api/v1/subcategories/:id
// @access Private
exports.deleteSubCategory = factory.deleteOne(SubCategoryModel);
