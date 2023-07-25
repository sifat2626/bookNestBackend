const User =require("../models/user.js");
const { hashPassword, comparePassword } =require("../helpers/auth.js");
const jwt =require("jsonwebtoken");
require("dotenv").config();




exports.register = async (req, res) => {
  try {
    // 1. destructure name, email, password from req.body
    const { name, email, password } = req.body;
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
    const hashedPassword = await hashPassword(password);
    // 5. register user
    const user = await new User({
      name,
      email,
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
    const match = await comparePassword(password, user.password);
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
      token:'',
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
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the entered password with the user's hashed password
    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    return res.status(200).json({ message: 'Password confirmed successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occurred' });
  }
};
exports.secret = async (req, res) => {
  res.json({ currentUser: req.user });
};


exports.getUserById = async (req,res) =>{
  try{
    const user = User.findById(id);
    res.status(200).json(user)
  }catch (error){
    res.status(400).json(error)
  }
}
