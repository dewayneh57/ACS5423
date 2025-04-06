const mongoose = require('mongoose');
const BrandedFood = require('../models/BrandedFoodSchema'); 

const cache = {
    categories: []
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

  module.exports = {
    cache,
    loadCategories
  };