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
  forgotPassword,
  resetPassword,
  userList,
  adminList,
  getUserById,
  deleteUser,
  changeAdminStatus,
  updateInterest,
  getInterestedBooks
} = require("../controllers/auth.js");

// get all user
router.get("/allusers/:pageNo/:perPage/:searchKeyword",requireSignin, isAdmin, userList);
router.get("/alladmin/:pageNo/:perPage/:searchKeyword",requireSignin, isAdmin, adminList);
router.get("/user/:id",requireSignin, getUserById)
router.post("/register", register);
router.post("/login", login);
// router.post("/logout", requireSignin, logout);
router.get("/auth-check", requireSignin, (req, res) => {
  res.json({ login: true });
});
router.get("/admin-check", requireSignin, isAdmin, (req, res) => {
  res.json({ admin: true });
});

// router.put("/profile", requireSignin, updateProfile);
router.put("/profile/:id", requireSignin, updateProfile);
router.delete("/user/:id", requireSignin, deleteUser);
// testing
router.get("/secret", requireSignin, isAdmin, secret);

// forgot reset password
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);
router.put("/adminstatus/:id", requireSignin, isAdmin, changeAdminStatus);
// orders
// router.get("/orders", requireSignin, getOrders);
// router.get("/all-orders", requireSignin, isAdmin, allOrders);
router.post("/interests", requireSignin, updateInterest);
router.get("/interestedbooks", requireSignin, getInterestedBooks);
module.exports = router;
