const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    photo:{
      type: String,
    },
    role: {
      type: Number,
      default: 0,
    },

  },
  { versionKey: false, timestamps: true }
);

//   Encrypt password before saving to DB
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }

//   // Hash password
//   const salt = await bcrypt.genSalt(12);
//   const hashedPassword = await bcrypt.hash(this.password, salt);
//   this.password = hashedPassword;
//   next();
// });
const User = mongoose.model("User", userSchema);

module.exports = User;
