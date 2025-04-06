// routes/foodRoutes.js
const express = require("express");
const router = express.Router();
const BrandedFood = require("../models/BrandedFoodSchema");
const FoodNutrient = require("../models/FoodNutrientSchema");

const { cache } = require("../modules/cache"); // adjust path as needed

// GET /categories - return distinct branded food categories
router.get("/api/categories", async (req, res) => {
  res.json(cache.categories);
});

// GET /foods?category=... | nutrient=...
router.get("/api/foods", async (req, res) => {
  const category = req.query.category;
  const nutrient = req.query.nutrient;

  if (!category && !nutrient) {
    return res
      .status(400)
      .json({ error: "Either Category or Nutrient is required" });
  }

  if (category) {
    try {
      const foods = await BrandedFood.find({ brandedFoodCategory: category });
      res.json(foods);
    } catch (err) {
      console.error("Error fetching foods by category:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (nutrient) {
    try {
      // Find all nutrient entries for this nutrient
      const nutrients = await FoodNutrient.find({ nutrientName: nutrient });
      console.log("found " + nutrients.length + " entries for " + nutrient);

      // Extract all unique fdcIds
      const fdcIds = nutrients.map((n) => n.fdcId);
      console.log("FDC ID's: " + fdcIds);

      // Now find all BrandedFood entries with those fdcIds
      const foods = await BrandedFood.find({ fdcId: { $in: fdcIds } });
      console.log("found " + foods.length + " foods for this nutrient");

      res.json(foods);
    } catch (err) {
      console.error("Error fetching foods by nutrient:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.get("/api/nutrients", async (req, res) => {
  res.json(cache.nutrients);
});

module.exports = router;
