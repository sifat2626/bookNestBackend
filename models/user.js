const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type:String
    },
    role: {
      type: Number,
      default: 0,
    },

    resetPasswordToken: {
      type: String
    },
    resetPasswordTokenExpires: {
      type: Date
    },
  },
  { versionKey: false, timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
