const User = require("../models/user.js");
const Token = require("../models/token.js");
const sendEmail = require("../helpers/sendEmail.js");

const { hashPassword, comparePassword } = require("../helpers/auth.js");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

require("dotenv").config();

exports.register = async (req, res) => {
  try {
    // 1. destructure name, email, password from req.body
    const { name, email, password, photo,address,role } = req.body;
    // 2. all fields require validation
    if (!name.trim()) {
      return res.json({ error: "Name is required" });
    }
    if (!email) {
      return res.json({ error: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.json({ error: "Password must be at least 6 characters long" });
    }
    // 3. check if email is taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ error: "Email is taken" });
    }
    // 4. hash password
    // const hashedPassword = await hashPassword(password);
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. register user
    const user = await new User({
      name,
      email,
      photo,
      address,
      role: role || 0,
      password: hashedPassword,
    }).save();
    // 6. create signed jwt
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // 7. send response
    res.json({
      user: {
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
        address: user.address,
      },
      token,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.json({ error: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.json({ error: "Password must be at least 6 characters long" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "User not found" });
    }
    // console.log(password,user.password);
    const match = await bcrypt.compare(password, user.password);
    // console.log(match);
    if (!match) {
      return res.json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      user: {
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
        address: user.address,
      },
      token,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({
      token: "",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.confirmPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare the entered password with the user's hashed password
    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    return res.status(200).json({ message: "Password confirmed successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "An error occurred" });
  }
};

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User does not exist");
  }

  // Delete token if it exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // Create Reste Token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  // res.send("Forgot password")

  // Hash token before saving to DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // res.send("Forgot password updated")

  // Save Token to DB
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), // Thirty minutes
  }).save();
  const tokenData = await Token.find({}).populate("userId");
  console.log("tokenData", tokenData);
  // Construct Reset Url
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  // Reset Email
  const message = `
      <h2>Hello ${user.name}</h2>
      <p>Please use the url below to reset your password</p>  
      <p>This reset link is valid for only 30minutes.</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p>Regards...</p>
      <p>Pinvent Team</p>
    `;
  const subject = "Password Reset Request";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).json({ success: true, message: "Reset Email Sent again" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

//docs: Reset Password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  // Hash token, then compare to Token in DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // fIND tOKEN in DB
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  // Find user
  const user = await User.findOne({ _id: userToken.userId });
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({
    message: "Password Reset Successful, Please Login",
  });
});

exports.secret = async (req, res) => {
  res.json({ currentUser: req.user });
};

exports.updateProfile = async (req, res) => {
  // const id= req.user._id;
  const id = req.params.id;
  try {
    const { name, password, photo, address } = req.body;
    const user = await User.findById(id);

    // check password length
    if (password && password.length < 6) {
      return res.json({
        error: "Password is required and should be min 6 characters long",
      });
    }
    // hash the password
    const hashedPassword = password ? await hashPassword(password) : undefined;

    const updated = await User.findByIdAndUpdate(
      // req.user._id,
      id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        photo: photo || user.photo,
        address: address || user.address,
      },
      { new: true }
    );

    updated.password = undefined;
    res.json(updated);
  } catch (err) {
    console.log(err);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = User.findById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
};

// modified for page and search system
exports.userList = async (req, res) => {
  try {
    let pageNo = Number(req.params.pageNo) || 1;
    let perPage = Number(req.params.perPage) || 10;
    let searchValue = req.params.searchKeyword;
    let skipRow = (pageNo - 1) * perPage;

    let data;
    if (searchValue !== "0") {
      let SearchRgx = { $regex: searchValue, $options: "i" };
      // search in every possible field
      let SearchQuery = {
        $or: [{ name: SearchRgx }, { email: SearchRgx }],
      };

      data = await User.aggregate([
        {
          $facet: {
            Total: [
              { $match: SearchQuery },
              { $match: { role: { $eq: 0 } } },
              { $count: "count" },
            ],
            Rows: [
              { $match: SearchQuery },
              { $match: { role: { $eq: 0 } } },
              { $skip: skipRow },
              { $limit: perPage },
            ],
          },
        },
      ]);
    } else {
      data = await User.aggregate([
        {
          $facet: {
            Total: [{ $match: { role: { $eq: 0 } } }, { $count: "count" }],
            Rows: [
              { $match: { role: { $eq: 0 } } },
              { $skip: skipRow },
              { $limit: perPage },
            ],
          },
        },
      ]);
    }
    // console.log('data', data[0].Rows[0]);

    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(200).json({ status: "fail", error: error.message });
  }
};
exports.adminList = async (req, res) => {
  try {
    let pageNo = Number(req.params.pageNo) || 1;
    let perPage = Number(req.params.perPage) || 10;
    let searchValue = req.params.searchKeyword;
    let skipRow = (pageNo - 1) * perPage;

    let data;
    if (searchValue !== "0") {
      let SearchRgx = { $regex: searchValue, $options: "i" };
      // search in every possible field
      let SearchQuery = {
        $or: [{ name: SearchRgx }, { email: SearchRgx }],
      };

      data = await User.aggregate([
        {
          $facet: {
            Total: [
              { $match: SearchQuery },
              { $match: { role: { $eq: 1 } } },
              { $count: "count" },
            ],
            Rows: [
              { $match: SearchQuery },
              { $match: { role: { $eq: 1 } } },
              { $skip: skipRow },
              { $limit: perPage },
            ],
          },
        },
      ]);
    } else {
      data = await User.aggregate([
        {
          $facet: {
            Total: [{ $match: { role: { $eq: 1 } } }, { $count: "count" }],
            Rows: [
              { $match: { role: { $eq: 1 } } },
              { $skip: skipRow },
              { $limit: perPage },
            ],
          },
        },
      ]);
    }
    // console.log('data', data[0].Rows[0]);

    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(200).json({ status: "fail", error: error.message });
  }
};
