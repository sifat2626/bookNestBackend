const express = require("express");

const router = express.Router();

// middlewares
const { requireSignin, isAdmin } = require("../middlewares/auth.js");
// controllers
const {
  register,
  login,
  secret,
  updateProfile,
  logout,
  forgotPassword,
  resetPassword,
  userList,
  adminList
} = require("../controllers/auth.js");

// get all user
router.get("/allusers/:pageNo/:perPage/:searchKeyword", userList);
router.get("/alladmin/:pageNo/:perPage/:searchKeyword", adminList);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireSignin, logout);
router.get("/auth-check", requireSignin, (req, res) => {
  res.json({ login: true });
});
router.get("/admin-check", requireSignin, isAdmin, (req, res) => {
  res.json({ admin: true });
});

// router.put("/profile", requireSignin, updateProfile);
router.put("/profile/:id", requireSignin, updateProfile);

// testing
router.get("/secret", requireSignin, isAdmin, secret);

// forgot reset password
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);
// orders
// router.get("/orders", requireSignin, getOrders);
// router.get("/all-orders", requireSignin, isAdmin, allOrders);

module.exports = router;
