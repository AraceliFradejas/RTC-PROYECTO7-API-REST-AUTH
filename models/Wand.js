const mongoose = require("mongoose");

const wandSchema = new mongoose.Schema(
  {
    wood: {
      type: String,
      required: true,
      trim: true,
    },
    core: {
      type: String,
      required: true,
      trim: true,
    },
    length: {
      type: Number,
      required: true,
      min: 8,
      max: 18,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wand", wandSchema);
