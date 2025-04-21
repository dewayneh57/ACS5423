/*+-----------------------------------------------------------------------------------+
 *|                                                                                   |
 *| NutriBytes server-side API implementation                                         |
 *|                                                                                   |
 *+-----------------------------------------------------------------------------------+ 
 */
const express = require("express");
const router = express.Router();

const BrandedFood = require("../models/BrandedFoodSchema");
const FoodNutrient = require("../models/FoodNutrientSchema");
const Options = require("../models/OptionsSchema");
const { cache } = require("../modules/cache"); // adjust path as needed

/**
 * Retrieve the options settings from the database.  If they do not exist, return 
 * defaults
 * 
 * Method: GET
 * Path:   /api/options 
 * Body:   none
 * Response: 
 * {"limit": "0",  # zero or greater, 0 = unlimited
 *  "caseSensitive" : "false",  # True or false 
 * }
 */
router.get("/api/options", async (req, res) => {
  try {
    let options = await Options.findOne({});
    console.log("Retrieving options...");

    if (!options) {
      // Provide defaults if no document exists
      options = new Options({ limit: 50, caseSensitive: false });
      await options.save();
    }

    res.json(options);
  } catch (err) {
    console.error("Error loading options:", err);
    res.status(500).json({ error: "Failed to load options" });
  }
});

/**
 * Save the options settings in the database. 
 * 
 * Method: POST
 * Path:   /api/options 
 * Body:   
 * {"limit": "0",  # zero or greater, 0 = unlimited
 *  "caseSensitive" : "false",  # True or false 
 * }
 */

router.post("/api/options", async (req, res) => {
  const { limit, caseSensitive } = req.body;
  console.log(
    "Setting options... limit=" + limit + ", case sensitive=" + caseSensitive
  );

  console.log("Received options:", { limit, caseSensitive });

  try {
    const updated = await Options.findOneAndUpdate(
      {},
      { limit, caseSensitive },
      { upsert: true, new: true }
    );
    cache.options = updated;
    res.sendStatus(204); // No Content
  } catch (err) {
    console.error("Error saving options:", err);
    res.status(500).json({ error: "Failed to save options" });
  }
});

/**
 * Retrieve the foods that are categorized with the supplied category name
 * 
 * Method: GET
 * Query Param(s): category - The name of the category to match. 
 * Response: 
 * [
 *   {
 *      "_id": "67f1f462ce8575fa49db68d7",  // database ID
 *      "fdcId": 360732,                    // fdcId of the food
 *      "description": "COCO LOPEZ, ...",   // description of the food
 *      "brandOwner": "COCO LOPEZ",         // brand owner
 *      "marketCountry": "United States",   // country
 *      "gtinUpc": 6543655593656,           // the UPC id
 *      "ingredients": "WATER, SUGAR, ...", // comma-separated list of ingredients
 *      "servingSize": 89,                  // serving size 
 *      "servingSizeUnit": "g",             // units of meaasure
 *      "householdServingFullText": "0.33 cup", // generic term of serving size 
 *      "brandedFoodCategory": "Alcohol",   // category of food 
 *      "publicationDate": "2019-04-01T00:00:00.000Z", // Date it was published in the catalog
 *      "nutrients": [                      // Array of nutrients 
 *          {
 *              "_id": "67f1f6eece8575fa49ef56d6", // Database ID of the nutrient
 *              "fdcId": 360732,            // the fdcId of the food
 *              "nutrientId": 1087,         // the fdc id of the nutrient 
 *              "nutrientName": "Calcium, Ca", // The name
 *              "nutrientNumber": 301,      // The fdc catelog number of the nutrient
 *              "nutrientUnit": "mg",       // measurement units 
 *              "amount": 0                 // Amount of the nutrient
 *          },
 *          ...
 *       ]
 *   }, ...
 * ]
 */
// GET /api/foods/categories?category=...
router.get("/api/foods/categories", async (req, res) => {
  const category = req.query.category;

  if (!category) {
    return res.status(400).json({
      error: "The category name must be supplied as a query parameter.",
    });
  }

  try {
    // Get the foods in the category selected
    const foods = await BrandedFood.find({
      brandedFoodCategory: category,
    }).limit(cache.options.limit);

    // Get the fdc id's for all these foods
    var fdcIds = foods.map((food) => food.fdcId);

    // Get all nutrients for all these FDC ids for the foods
    var allNutrients = await FoodNutrient.find({ fdcId: { $in: fdcIds } });

    // Group nutrients by fdcId
    var nutrientMap = new Map();
    for (const nutrient of allNutrients) {
      if (!nutrientMap.has(nutrient.fdcId)) {
        nutrientMap.set(nutrient.fdcId, []);
      }
      nutrientMap.get(nutrient.fdcId).push(nutrient);
    }

    // Attach nutrients to each food
    var foodsWithNutrients = foods.map((food) => ({
      ...food.toObject(),
      nutrients: nutrientMap.get(food.fdcId) || [],
    }));

    // Send response
    res.json(foodsWithNutrients);
  } catch (err) {
    console.error("Error fetching foods by category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Retrieve the foods and their ingredients based on a match to one or more nutrients, 
 * and a min/max range of the macro nutrients if specified. 
 * 
 * Method: GET
 * Query Params: 
 *     nutrient ----- The name of the nutrient to search for. 
 *     carbMin ------ If specified, the minimum amount of carbohydrates
 *     carbMax ------ If specified, the maximum amount of carbohydrates
 *     proteinMin --- If specified, the minimum amount of protein
 *     proteinMax --- If specified, the maximum amount of protein 
 *     fatMin ------- If specified, the minimum amount of fat
 *     fatMax ------- If specified, the maximum amount of fat
 * 
 * Response: 
 *    See GET /api/foods/categories?category=....  Note, the nutrient array will 
 *    only include the nutrients that were provided in the query.  
 */
// GET /api/foods/nutrients?nutrient=... | carbMin/carbMax=... | proteinMin/proteinMax=... | fatMin/fatMax=...
router.get("/api/foods/nutrients", async (req, res) => {
  console.log(req.originalUrl);

  const { nutrient, carbMin, carbMax, proteinMin, proteinMax, fatMin, fatMax } =
    req.query;

  // Ensure at least one filter is provided
  if (
    !nutrient &&
    !carbMin &&
    !carbMax &&
    !proteinMin &&
    !proteinMax &&
    !fatMin &&
    !fatMax
  ) {
    return res.status(400).json({
      error:
        "At least one filter (nutrient, carb, protein, or fat) must be provided",
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
      nutrientFilters.push({
        nutrientName: "Carbohydrate, by difference",
        amount: range,
      });
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
      nutrientFilters.push({
        nutrientName: "Total lipid (fat)",
        amount: range,
      });
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
    const requiredNames = nutrientFilters.map((f) => f.nutrientName);
    const matchingFdcIds = Array.from(nutrientMap.entries())
      .filter(([_, nutrients]) => {
        const present = new Set(nutrients.map((n) => n.nutrientName));
        return requiredNames.every((name) => present.has(name));
      })
      .map(([fdcId]) => fdcId);

    // Fetch foods and attach their nutrients from the same map
    const foods = await BrandedFood.find({
      fdcId: { $in: matchingFdcIds },
    }).limit(cache.options.limit);

    const foodsWithNutrients = foods.map((food) => ({
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

/**
 * Get the Foods by brand name. 
 * Query Parameter(s):
 *   brand --- The brand name to return foods 
 * 
 * Response: 
 *    See GET /api/foods/categories?category=...
 */
// GET /api/foods/brands?brand=...
router.get("/api/foods/brands", async (req, res) => {
  const brand = req.query.brand;

  if (!brand) {
    return res.status(400).json({
      error: "Either Category, Nutrient, Brand, or Keyword is required",
    });
  }
  try {
    const foods = await BrandedFood.find({ brandOwner: brand }).limit(cache.options.limit);

    // Get the fdc id's for all these foods
    var fdcIds = foods.map((food) => food.fdcId);

    // Get all nutrients for all these FDC ids for the foods
    var allNutrients = await FoodNutrient.find({ fdcId: { $in: fdcIds } });

    // Group nutrients by fdcId
    var nutrientMap = new Map();
    for (const nutrient of allNutrients) {
      if (!nutrientMap.has(nutrient.fdcId)) {
        nutrientMap.set(nutrient.fdcId, []);
      }
      nutrientMap.get(nutrient.fdcId).push(nutrient);
    }

    // Attach nutrients to each food
    var foodsWithNutrients = foods.map((food) => ({
      ...food.toObject(),
      nutrients: nutrientMap.get(food.fdcId) || [],
    }));

    // Send response
    res.json(foodsWithNutrients);
  } catch (err) {
    console.error("Error fetching foods by category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Return foods that match a keyword in their description, brand, nutrients, or ingredients. 
 * 
 * Query Paramter(s):
 *    keyword --- A key word or regular expression. 
 * 
 * Response: 
 *    See GET /api/foods/categories?category=...
 */
// GET /api/foods/keywords?keyword=...
router.get("/api/foods/keywords", async (req, res) => {
  const keyword = req.query.keyword;

  if (!keyword) {
    return res.status(400).json({
      error: "Either Category, Nutrient, Brand, or Keyword is required",
    });
  }
  console.log("Performing keyword search..." + keyword);
  const searchRegex = new RegExp(keyword, cache.options.caseSensitive ? "" : "i");

  const foods = await BrandedFood.find({
    $or: [
      { description: searchRegex },
      { brandOwner: searchRegex },
      { marketCountry: searchRegex },
      { ingredients: searchRegex },
      { householdServingFullText: searchRegex },
      { brandedFoodCategory: searchRegex },
    ],
  }).limit(cache.options.limit);

  // Get the fdc id's for all these foods
  var fdcIds = foods.map((food) => food.fdcId);
  // Get all nutrients for all these FDC ids for the foods
  var allNutrients = await FoodNutrient.find({ fdcId: { $in: fdcIds } });

  // Group nutrients by fdcId
  var nutrientMap = new Map();
  for (const nutrient of allNutrients) {
    if (!nutrientMap.has(nutrient.fdcId)) {
      nutrientMap.set(nutrient.fdcId, []);
    }
    nutrientMap.get(nutrient.fdcId).push(nutrient);
  }

  // Attach nutrients to each food
  var foodsWithNutrients = foods.map((food) => ({
    ...food.toObject(),
    nutrients: nutrientMap.get(food.fdcId) || [],
  }));

  // Send response
  res.json(foodsWithNutrients);
});

// GET /api/categories - return distinct branded food categories
router.get("/api/categories", async (req, res) => {
  res.json(cache.categories);
});

// GET /api/nutrients - return the distinct list of all nutrients
router.get("/api/nutrients", async (req, res) => {
  res.json(cache.nutrients);
});

// GET /api/brands -- Return the list of all distinct brand names.
router.get("/api/brands", async (req, res) => {
  res.json(cache.brands);
});

module.exports = router;
