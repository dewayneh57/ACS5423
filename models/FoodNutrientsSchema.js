const mongoose = require("mongoose");

const FoodNutrientsSchema = new mongoose.Schema(
  {
    fdcId: { type: String, required: true },
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
