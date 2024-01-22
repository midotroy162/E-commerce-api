const express = require("express");

const {
  addProductToWishList,
  removeProductFromWishList,
  getLoggedUserWishList,
} = require("../services/wishlistService");

const authService = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .post(
    authService.protect,
    authService.allowedTo("user"),
    addProductToWishList
  )
  .get(
    authService.protect,
    authService.allowedTo("user"),
    getLoggedUserWishList
  );
router.delete(
  "/:productId",
  authService.protect,
  authService.allowedTo("user"),
  removeProductFromWishList
);
module.exports = router;
