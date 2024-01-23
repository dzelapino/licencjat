const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const ScoreSchema = new Schema({
  amount: {
    type: String,
    required: true,
  },
  private: {
    type: Boolean,
    required: true,
  },
  date: {
    type: Date,
  },
  game: {
    type: Schema.Types.ObjectId,
    ref: "Game",
  },
  player: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Score", ScoreSchema);
