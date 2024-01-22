const express = require("express");

const {
  addAddress,
  removeAddress,
  getLoggedUserAddress,
} = require("../services/addressService");

const authService = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .post(authService.protect, authService.allowedTo("user"), addAddress)
  .get(
    authService.protect,
    authService.allowedTo("user"),
    getLoggedUserAddress
  );
router.delete(
  "/:addressId",
  authService.protect,
  authService.allowedTo("user"),
  removeAddress
);
module.exports = router;
