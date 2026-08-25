const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    founder: {
      type: String,
      required: true,
      trim: true,
    },
    colors: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    traits: {
      type: [{ type: String, trim: true }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("House", houseSchema);
