const express =require("express");

const router = express.Router();

// middlewares
const { requireSignin, isAdmin } =require("../middlewares/auth.js");
// controllers
const {
  register,

} =require("../controllers/auth.js");

router.post("/register", register);


module.exports= router;
