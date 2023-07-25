const express =require("express");

const router = express.Router();

// middlewares
const { requireSignin, isAdmin } =require("../middlewares/auth.js");
// controllers
const {
  register,login,logout,secret

} =require("../controllers/auth.js");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireSignin, logout);
router.get("/auth-check", requireSignin, (req, res) => {
  res.json({ ok: true });
});
router.get("/admin-check", requireSignin, isAdmin, (req, res) => {
  res.json({ ok: true });
});


// testing
router.get("/secret", requireSignin, isAdmin, secret);


module.exports= router;
