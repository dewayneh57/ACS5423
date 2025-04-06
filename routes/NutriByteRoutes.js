// routes/foodRoutes.js
const express = require("express");
const router = express.Router();
const BrandedFood = require("../models/BrandedFoodSchema");
const FoodNutrient = require("../models/FoodNutrientSchema");

const { cache } = require("../modules/cache"); // adjust path as needed

// GET /foods?category=... | nutrient=... | brand=... | keyword=... 
router.get("/api/foods", async (req, res) => {
  const category = req.query.category;
  const nutrient = req.query.nutrient;
  const brand = req.query.brand; 
  const keyword = req.query.keyword; 

  if (!category && !nutrient && !brand && !keyword) {
    return res
      .status(400)
      .json({ error: "Either Category, Nutrient, Brand, or Keyword is required" });
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

      // Extract all unique fdcIds
      const fdcIds = nutrients.map((n) => n.fdcId);

      // Now find all BrandedFood entries with those fdcIds
      const foods = await BrandedFood.find({ fdcId: { $in: fdcIds } });

      res.json(foods);
    } catch (err) {
      console.error("Error fetching foods by nutrient:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if(brand) { 
    try {
      const foods = await BrandedFood.find({ brandOwner: brand });
      res.json(foods);
    } catch (err) {
      console.error("Error fetching foods by brand:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  } else { 
    console.log("Performing keyword search..." + keyword);
    const searchRegex = new RegExp(keyword, "i"); 

    const foods = await BrandedFood.find({
      $or: [
        { description: searchRegex },
        { brandOwner: searchRegex },
        { marketCountry: searchRegex },
        { ingredients: searchRegex },
        { householdServingFullText: searchRegex },
        { brandedFoodCategory: searchRegex }
      ]
    });
    console.log("Found " + foods.length + " foods"); 

    res.json(foods);
  }
});

// GET /categories - return distinct branded food categories
router.get("/api/categories", async (req, res) => {
  res.json(cache.categories);
});

router.get("/api/nutrients", async (req, res) => {
  res.json(cache.nutrients);
});

router.get("/api/brands", async (req, res) => { 
  res.json(cache.brands);
});

module.exports = router;
