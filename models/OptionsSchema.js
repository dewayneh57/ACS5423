const mongoose = require("mongoose");

const OptionsSchema = new mongoose.Schema(
  {
    limit: {
      type: Number,
      required: true,
      min: 0,
      default: 50
    },
    caseSensitive: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    collection: "AppOptions"
  }
);

module.exports = mongoose.model("Options", OptionsSchema);
