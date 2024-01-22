const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// @desc    Add address to user addresses List
// @route   POST /api/v1/addresses
// @access  Protected/User
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );
  res.status(200).json({
    status: "Success",
    message: "Address add successfully",
    data: user.addresses,
  });
});
// @desc    Delete address from list of user address
// @route   DELETE /api/v1/addresses/:addressId
// @access  Protected/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  );
  res.status(200).json({
    status: "Success",
    message: "product removed successfully",
    data: user.wishlist,
  });
});
// @desc    get logged user address
// @route   GET /api/v1/addresses
// @access  Protected/User
exports.getLoggedUserAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");
  res.status(200).json({
    status: "Success",
    results: user.addresses.lenght,
    data: user.addresses,
  });
});
