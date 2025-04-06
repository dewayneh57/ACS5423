// routes/foodRoutes.js
const express = require("express");
const router = express.Router();
const BrandedFood = require("../models/BrandedFoodSchema");
const { cache } = require('../modules/cache'); // adjust path as needed


// GET /categories - return distinct branded food categories
router.get('/api/categories', async (req, res) => {
    res.json(cache.categories);
});

// GET /foods?category=Snacks
router.get('/api/foods', async (req, res) => {
    const category = req.query.category;
    if (!category) return res.status(400).json({ error: 'Category is required' });
  
    try {
      const foods = await BrandedFood.find({ brandedFoodCategory: category }).limit(100);
      res.json(foods);
    } catch (err) {
      console.error('Error fetching foods:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;
