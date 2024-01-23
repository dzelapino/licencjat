const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const GameSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: [5, "Your game name needs to be between 5 to 30 characters"],
    maxLength: [30, "Your game name needs to be between 5 to 30 characters"],
    unique: true,
  },
  elementToCompare: {
    type: String,
    required: true,
    minLength: [4, "Element is too short"],
    maxLength: [20, "Element is too long"],
  },
  order: {
    type: String,
    required: true,
    enum: ["asc", "desc"],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "test", "rejected"],
    default: "test",
  },
  files: [],
  testComment: {
    type: String,
  },
});

module.exports = mongoose.model("Game", GameSchema);
