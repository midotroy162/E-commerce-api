const { check, body } = require("express-validator");

const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Review = require("../../models/reviewModel");

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review Id"),
  validatorMiddleware,
];
exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("Ratings value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("ratings value must be between 1 to 5"),
  check("user").isMongoId().withMessage("invalid review id format"),
  check("product")
    .isMongoId()
    .withMessage("invalid review id format")
    .custom((val, { req }) =>
      // Check if logged user create review before

      Review.findOne({ user: req.user._id, product: req.body.product }).then(
        (review) => {
          if (review) {
            return Promise.reject(
              new Error("You already created a review before")
            );
          }
        }
      )
    ),

  validatorMiddleware,
];
exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review Id")
    .custom((val, { req }) =>
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(
            new Error(`there is no review with id :${val}`)
          );
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("You are not allowed to perform that action")
          );
        }
      })
    ),

  validatorMiddleware,
];
exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review Id")
    .custom((val, { req }) => {
      if (req.user.role === "user") {
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`there is no review with id :${val}`)
            );
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error("You are not allowed to perform that action")
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];
