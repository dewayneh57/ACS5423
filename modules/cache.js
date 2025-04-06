const mongoose = require('mongoose');
const BrandedFood = require('../models/BrandedFoodSchema'); 
const FoodNutrient = require('../models/FoodNutrientSchema'); 

const cache = {
    categories: [],
    nutrients: []
}; 

async function loadCategories() {
    try {
      const categories = await BrandedFood.distinct('brandedFoodCategory'); 
      cache.categories = categories.sort();
      console.log('Categories loaded into cache:', categories.length);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  async function loadNutrients() {
    try {
      const nutrients = await FoodNutrient.distinct('nutrientName'); 
      cache.nutrients = nutrients.sort();
      console.log('Nutrients loaded into cache:', nutrients.length);
    } catch (err) {
      console.error('Failed to load nutrients:', err);
    }
  }


  module.exports = {
    cache,
    loadCategories,
    loadNutrients
  };