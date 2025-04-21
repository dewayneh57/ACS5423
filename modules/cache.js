const mongoose = require("mongoose");
const BrandedFood = require("../models/BrandedFoodSchema");
const FoodNutrient = require("../models/FoodNutrientSchema");
const Options = require("../models/OptionsSchema");

const cache = {
  categories: [],
  nutrients: [],
  brands: [],
  options: null,
};

/**
 * This function is called during server start up to load aand cache all categories.
 */
async function loadCategories() {
  try {
    const categories = await BrandedFood.distinct("brandedFoodCategory");
    cache.categories = categories.sort();
    console.log("Categories loaded into cache:", categories.length);
  } catch (err) {
    console.error("Failed to load categories:", err);
  }
}

/**
 * This function is called during server start up to load aand cache all nutrients.
 */
async function loadNutrients() {
  try {
    const nutrients = await FoodNutrient.distinct("nutrientName");
    cache.nutrients = nutrients.sort();
    console.log("Nutrients loaded into cache:", nutrients.length);
  } catch (err) {
    console.error("Failed to load nutrients:", err);
  }
}

/**
 * This function is called during server start up to load aand cache all brands.
 */
async function loadBrands() {
  try {
    const brands = await BrandedFood.distinct("brandOwner");
    cache.brands = brands.sort();
    console.log("Brands loaded into cache:", brands.length);
  } catch (err) {
    console.error("Failed to load brands:", err);
  }
}

/**
 * This function is called during server start up to load aand cache all operational options.
 */
async function loadOptions() {
  try {
    let options = await Options.findOne({});
    if (!options) {
      options = new Options({ limit: 50, caseSensitive: false });
      await options.save();
    }

    cache.options = options;
    console.log("Options loaded into cache:", options);
  } catch (err) {
    console.error("Failed to load options:", err);
  }
}

module.exports = {
  cache,
  loadCategories,
  loadNutrients,
  loadBrands,
  loadOptions,
};
