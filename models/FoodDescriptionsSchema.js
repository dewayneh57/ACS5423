const mongoose = require("mongoose");

const FoodDescriptionsSchema = new mongoose.Schema(
  {
    fdcId: { type: String, required: true },
    description: { type: String, required: true },
    publicationDate: { type: Date, required: true },
  },
  {
    collection: "FoodDescription",
  }
);

module.exports = mongoose.model("FoodDescription", FoodDescriptionSchema);
