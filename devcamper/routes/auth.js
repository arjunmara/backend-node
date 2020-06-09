const express = require("express");

const {
  register,
  login,
  getMe,
  forgotPassword,
  updateDetails,
  updatePassword,
  logOut,
} = require("../controllers/auth");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgotpassword", forgotPassword);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);
router.get("/logout", logOut);

module.exports = router;
