// routes/foodRoutes.js
const express = require("express");
const router = express.Router();
const BrandedFood = require("../models/BrandedFoodSchema");
const FoodNutrient = require("../models/FoodNutrientSchema");

const { cache } = require("../modules/cache"); // adjust path as needed

// GET /foods/categories?category=...
router.get("/api/foods/categories", async (req, res) => {
  const category = req.query.category;

  if (!category) {
    return res
      .status(400)
      .json({
        error: "The category name must be supplied as a query parameter.",
      });
  }

  try {

    // Get the foods in the category selected 
    const foods = await BrandedFood.find({ brandedFoodCategory: category }).limit(50);

    // Get the fdc id's for all these foods
    var fdcIds = foods.map(food => food.fdcId); 

    // Get all nutrients for all these FDC ids for the foods 
    var allNutrients = await FoodNutrient.find({fdcId: { $in: fdcIds} }); 

    // Group nutrients by fdcId
    var nutrientMap = new Map();
    for (const nutrient of allNutrients) {
      if (!nutrientMap.has(nutrient.fdcId)) {
        nutrientMap.set(nutrient.fdcId, []);
      }
      nutrientMap.get(nutrient.fdcId).push(nutrient);
    }

    // Attach nutrients to each food
    var foodsWithNutrients = foods.map(food => ({
      ...food.toObject(),
      nutrients: nutrientMap.get(food.fdcId) || []
    }));

    // Send response
    res.json(foodsWithNutrients);
  } catch (err) {
    console.error("Error fetching foods by category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /foods/nutrients?nutrient=... | carbMin/carbMax=... | proteinMin/proteinMax=... | fatMin/fatMax=...
router.get("/api/foods/nutrients", async (req, res) => {

  console.log(req.originalUrl);

  const {
    nutrient,
    carbMin,
    carbMax,
    proteinMin,
    proteinMax,
    fatMin,
    fatMax,
  } = req.query;

  // Ensure at least one filter is provided
  if (
    !nutrient &&
    !carbMin && !carbMax &&
    !proteinMin && !proteinMax &&
    !fatMin && !fatMax
  ) {
    return res.status(400).json({
      error: "At least one filter (nutrient, carb, protein, or fat) must be provided",
    });
  }

  try {
    // Build nutrient filters
    const nutrientFilters = [];

    if (nutrient) {
      nutrientFilters.push({ nutrientName: nutrient });
    }
    if (carbMin || carbMax) {
      const range = {};
      if (carbMin) range.$gte = parseFloat(carbMin);
      if (carbMax) range.$lte = parseFloat(carbMax);
      nutrientFilters.push({ nutrientName: "Carbohydrate, by difference", amount: range });
    }
    if (proteinMin || proteinMax) {
      const range = {};
      if (proteinMin) range.$gte = parseFloat(proteinMin);
      if (proteinMax) range.$lte = parseFloat(proteinMax);
      nutrientFilters.push({ nutrientName: "Protein", amount: range });
    }
    if (fatMin || fatMax) {
      const range = {};
      if (fatMin) range.$gte = parseFloat(fatMin);
      if (fatMax) range.$lte = parseFloat(fatMax);
      nutrientFilters.push({ nutrientName: "Total lipid (fat)", amount: range });
    }

    // Single query for all nutrient filter matches
    const allMatches = await FoodNutrient.find({ $or: nutrientFilters });

    // Group by fdcId
    const nutrientMap = new Map();
    for (const n of allMatches) {
      if (!nutrientMap.has(n.fdcId)) {
        nutrientMap.set(n.fdcId, []);
      }
    nutrientMap.get(n.fdcId).push(n);
    }

    // Find fdcIds that match *all* requested nutrient names
    const requiredNames = nutrientFilters.map(f => f.nutrientName);
    const matchingFdcIds = Array.from(nutrientMap.entries())
      .filter(([_, nutrients]) => {
        const present = new Set(nutrients.map(n => n.nutrientName));
        return requiredNames.every(name => present.has(name));
      })
      .map(([fdcId]) => fdcId);

    // Fetch foods and attach their nutrients from the same map
    const foods = await BrandedFood.find({ fdcId: { $in: matchingFdcIds } }).limit(50);

    const foodsWithNutrients = foods.map(food => ({
      ...food.toObject(),
      nutrients: nutrientMap.get(food.fdcId) || [],
    }));

    console.log(`Found ${foodsWithNutrients.length} foods`);
    res.json(foodsWithNutrients);
  } catch (err) {
    console.error("Error fetching foods by category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /foods/brands?brand=...
router.get("/api/foods/brands", async (req, res) => {
  const brand = req.query.brand;

  if (!brand) {
    return res
      .status(400)
      .json({
        error: "Either Category, Nutrient, Brand, or Keyword is required",
      });
  }
  try {
    const foods = await BrandedFood.find({ brandOwner: brand });

    // Get the fdc id's for all these foods
    var fdcIds = foods.map(food => food.fdcId); 

    // Get all nutrients for all these FDC ids for the foods 
    var allNutrients = await FoodNutrient.find({fdcId: { $in: fdcIds} }); 

    // Group nutrients by fdcId
    var nutrientMap = new Map();
    for (const nutrient of allNutrients) {
      if (!nutrientMap.has(nutrient.fdcId)) {
        nutrientMap.set(nutrient.fdcId, []);
      }
      nutrientMap.get(nutrient.fdcId).push(nutrient);
    }

    // Attach nutrients to each food
    var foodsWithNutrients = foods.map(food => ({
      ...food.toObject(),
      nutrients: nutrientMap.get(food.fdcId) || []
    }));

    // Send response
    res.json(foodsWithNutrients);
  } catch (err) {
    console.error("Error fetching foods by category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /foods/keywords?keyword=...
router.get("/api/foods/keywords", async (req, res) => {
  const keyword = req.query.keyword;

  if (!keyword) {
    return res
      .status(400)
      .json({
        error: "Either Category, Nutrient, Brand, or Keyword is required",
      });
  }
  console.log("Performing keyword search..." + keyword);
  const searchRegex = new RegExp(keyword, "i");

  const foods = await BrandedFood.find({
    $or: [
      { description: searchRegex },
      { brandOwner: searchRegex },
      { marketCountry: searchRegex },
      { ingredients: searchRegex },
      { householdServingFullText: searchRegex },
      { brandedFoodCategory: searchRegex },
    ],
  });

  // Get the fdc id's for all these foods
  var fdcIds = foods.map(food => food.fdcId); 
  // Get all nutrients for all these FDC ids for the foods 
  var allNutrients = await FoodNutrient.find({fdcId: { $in: fdcIds} }); 

  // Group nutrients by fdcId
  var nutrientMap = new Map();
  for (const nutrient of allNutrients) {
    if (!nutrientMap.has(nutrient.fdcId)) {
      nutrientMap.set(nutrient.fdcId, []);
    }
    nutrientMap.get(nutrient.fdcId).push(nutrient);
  }

  // Attach nutrients to each food
  var foodsWithNutrients = foods.map(food => ({
    ...food.toObject(),
    nutrients: nutrientMap.get(food.fdcId) || []
  }));

  // Send response
  res.json(foodsWithNutrients);
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
