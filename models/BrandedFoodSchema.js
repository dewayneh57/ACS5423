const mongoose = require("mongoose");

const BrandedFoodSchema = new mongoose.Schema(
  {
    fdcId: { type: String, required: true },
    description: { type: String, required: true },
    brandOwner: { type: String, required: true },
    marketCountry: { type: String, required: true },
    gtinUpc: { type: Number, required: true },
    ingredients: { type: String, required: true },
    servingSize: { type: Number, required: true },
    servingSizeUnit: { type: String, required: true },
    householdServingFullText: { type: String, required: false },
    brandedFoodCategory: { type: String, required: true },
    publicationDate: { type: Date, required: true },
  },
  {
    collection: "BrandedFood",
  }
);

module.exports = mongoose.model("BrandedFood", BrandedFoodSchema);
