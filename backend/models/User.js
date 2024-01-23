const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    minLength: [
      5,
      "Your username length needs to fit between 5 to 15 character range",
    ],
    maxLength: [
      15,
      "Your username length needs to fit between 5 to 15 character range",
    ],
    unique: true,
  },
  email: {
    type: String,
    required: true,
    maxLength: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: [8, "Your password needs at least 8 characters long"],
  },
  admin: {
    type: Boolean,
    required: true,
    default: false,
  },
  disabled: {
    type: Boolean,
    required: true,
  },
});

UserSchema.plugin(require("mongoose-role"), {
  roles: ["public", "user", "admin"],
  accessLevels: {
    public: ["public", "user", "admin"],
    user: ["user", "admin"],
    admin: ["admin"],
  },
});

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  bcrypt.hash(this.password, 11, (err, hashedPassword) => {
    if (err) return next(err);
    this.password = hashedPassword;
    next();
  });
});

UserSchema.pre("findOneAndUpdate", async function () {
  if (this._update.password)
    this._update.password = await bcrypt.hash(this._update.password, 11);
});

UserSchema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return callback(err);
    else {
      if (!isMatch) return callback(null, isMatch);
      return callback(null, this);
    }
  });
};

module.exports = mongoose.model("User", UserSchema);
