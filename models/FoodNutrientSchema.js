const mongoose = require("mongoose");

const FoodNutrientSchema = new mongoose.Schema(
  {
    fdcId: { type: Number, required: true },
    nutrientId: { type: Number, required: true },
    nutrientName: { type: String, required: true },
    nutrientNumber: { type: Number, required: true },
    nutrientUnit: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  {
    collection: "FoodNutrient",
  }
);

module.exports = mongoose.model("FoodNutrient", FoodNutrientSchema);
