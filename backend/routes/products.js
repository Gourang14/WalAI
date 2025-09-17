const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const recipeService = require('../services/recipeService');

// Middleware to authenticate token (optional for some endpoints)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// Helper function to detect if query is a recipe/dish name
const isRecipeQuery = (query) => {
  const recipeKeywords = [
    'pasta', 'pizza', 'curry', 'soup', 'salad', 'sandwich', 'burger', 'rice', 'noodles',
    'chicken', 'beef', 'fish', 'vegetable', 'fruit', 'dessert', 'cake', 'bread',
    'stir fry', 'fried', 'grilled', 'baked', 'roasted', 'steamed', 'boiled',
    'recipe', 'dish', 'meal', 'breakfast', 'lunch', 'dinner', 'snack'
  ];
  
  const queryLower = query.toLowerCase();
  return recipeKeywords.some(keyword => queryLower.includes(keyword)) ||
         queryLower.split(' ').length >= 2; // Multi-word queries are likely recipes
};

// Check ingredient availability for a product/recipe
router.post('/check-ingredients', authenticateToken, async (req, res) => {
  try {
    const { productName, dietType = 'vegetarian', servings = 2 } = req.body;

    if (!productName) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    console.log(`🔍 Checking ingredients for: ${productName}`);

    // Try to generate recipe and check ingredient availability
    try {
      const result = await recipeService.processRecipeRequest(productName, servings, dietType);
      
      const availableItems = result.availableItems || [];
      const missingItems = result.missingItems || [];
      
      res.status(200).json({
        success: true,
        data: {
          hasIngredients: availableItems.length > 0,
          availableItems: availableItems,
          missingItems: missingItems,
          totalIngredients: availableItems.length + missingItems.length,
          availabilityPercentage: Math.round((availableItems.length / (availableItems.length + missingItems.length)) * 100) || 0
        }
      });

    } catch (recipeError) {
      console.log(`No recipe found for ${productName}, checking as regular product`);
      
      // If recipe generation fails, check if it's a regular product
      const searchRegex = new RegExp(productName, 'i');
      const inventoryItems = await Inventory.find({
        $and: [
          { inStock: true },
          {
            $or: [
              { name: searchRegex },
              { tags: { $in: [searchRegex] } }
            ]
          }
        ]
      }).limit(10);

      res.status(200).json({
        success: true,
        data: {
          hasIngredients: inventoryItems.length > 0,
          availableItems: inventoryItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price
          })),
          missingItems: [],
          totalIngredients: inventoryItems.length,
          availabilityPercentage: inventoryItems.length > 0 ? 100 : 0
        }
      });
    }

  } catch (error) {
    console.error('Error checking ingredients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check ingredient availability',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Search products - ENHANCED MAIN SEARCH ENDPOINT
router.post('/search', authenticateToken, async (req, res) => {
  try {
    const { 
      query = '', 
      filters = {}, 
      category = '',
      checkIngredients = false,
      limit = 20
    } = req.body;
    
    console.log(`🔍 Searching for: "${query}" in category: "${category}"`);
    
    if (!query.trim()) {
      return res.status(400).json({ 
        message: 'Search query is required',
        products: []
      });
    }

    // For Food & Grocery category, check if this might be a recipe search
    const shouldTryRecipe = category === 'food-grocery' && isRecipeQuery(query);
    
    let recipeResults = [];
    let regularResults = [];

    // Try recipe search first if it seems like a recipe query
    if (shouldTryRecipe) {
      try {
        console.log(`🍳 Attempting recipe search for: "${query}"`);
        const recipeResult = await recipeService.processRecipeRequest(
          query, 
          filters.servings || 2, 
          filters.dietType || 'Veg'
        );

        if (recipeResult.availableItems && recipeResult.availableItems.length > 0) {
          // Convert recipe ingredients to product format
          recipeResults = recipeResult.availableItems.map(item => ({
            _id: item.inventoryId || `recipe_${Date.now()}_${Math.random()}`,
            name: item.name || item.ingredient,
            price: item.price || 2.99,
            description: `Fresh ${item.name || item.ingredient} for cooking`,
            image: item.image || `https://via.placeholder.com/200x200/4CAF50/white?text=${encodeURIComponent(item.name || item.ingredient)}`,
            category: 'food-grocery',
            tags: ['recipe-ingredient', filters.dietType || 'Veg'],
            quantity: item.requiredQuantity || item.quantity || 1,
            unit: item.unit || 'pieces',
            isRecipeIngredient: true,
            recipeName: recipeResult.recipe?.name || query,
            source: 'recipe',
            ingredientAvailability: {
              hasIngredients: true,
              availableItems: recipeResult.availableItems || [],
              missingItems: recipeResult.missingItems || []
            }
          }));

          console.log(`✅ Found ${recipeResults.length} recipe ingredients for "${query}"`);
        }
      } catch (recipeError) {
        console.log(`No recipe found for "${query}", falling back to regular search`);
      }
    }

    // Always do regular product search as well
    const searchRegex = new RegExp(query, 'i');
    
    // Build category filter
    const categoryFilter = category ? { category: category } : {};
    
    // Search products
    const products = await Product.find({
      $and: [
        { 'availability.isActive': true },
        categoryFilter,
        {
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { tags: { $in: [searchRegex] } },
            { searchKeywords: { $in: [searchRegex] } }
          ]
        }
      ]
    }).limit(limit);

    // Search inventory items
    const inventoryItems = await Inventory.find({
      $and: [
        { inStock: true },
        category ? { category: category } : {},
        {
          $or: [
            { name: searchRegex },
            { tags: { $in: [searchRegex] } },
            { searchKeywords: { $in: [searchRegex] } }
          ]
        }
      ]
    }).populate('productId').limit(limit);

    // Process regular results
    const seenIds = new Set();

    // Add products
    products.forEach(product => {
      if (!seenIds.has(product._id.toString())) {
        regularResults.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          description: product.description,
          image: product.image,
          category: product.category,
          tags: product.tags,
          dietaryTypes: product.dietaryTypes,
          isIngredient: product.isIngredient,
          source: 'product'
        });
        seenIds.add(product._id.toString());
      }
    });

    // Add inventory items
    inventoryItems.forEach(item => {
      const productId = item.productId?._id?.toString() || item._id.toString();
      if (!seenIds.has(productId)) {
        regularResults.push({
          _id: item._id,
          productId: item.productId?._id,
          name: item.name,
          price: item.price,
          description: item.productId?.description || `Fresh ${item.name}`,
          image: item.productId?.image || `https://via.placeholder.com/200x200/4CAF50/white?text=${encodeURIComponent(item.name)}`,
          category: item.category,
          tags: item.tags,
          quantity: item.quantity,
          unit: item.unit,
          inStock: item.inStock,
          source: 'inventory'
        });
        seenIds.add(productId);
      }
    });

    // Combine results - prioritize recipe results for food-grocery category
    let allResults = [];
    if (category === 'food-grocery' && recipeResults.length > 0) {
      allResults = [...recipeResults, ...regularResults];
    } else {
      allResults = [...regularResults, ...recipeResults];
    }

    // Add ingredient availability check if requested
    if (checkIngredients && category === 'food-grocery') {
      for (let product of allResults) {
        if (!product.ingredientAvailability) {
          try {
            const ingredientCheck = await recipeService.processRecipeRequest(
              product.name, 
              2, 
              filters.dietType || 'Veg'
            );
            
            product.ingredientAvailability = {
              hasIngredients: ingredientCheck.availableItems?.length > 0,
              availableItems: ingredientCheck.availableItems || [],
              missingItems: ingredientCheck.missingItems || []
            };
          } catch (err) {
            // If ingredient check fails, mark as no ingredients
            product.ingredientAvailability = {
              hasIngredients: false,
              availableItems: [],
              missingItems: []
            };
          }
        }
      }
    }

    // Limit final results
    allResults = allResults.slice(0, limit);

    console.log(`✅ Found ${allResults.length} total results for "${query}"`);

    let message = '';
    if (recipeResults.length > 0 && regularResults.length > 0) {
      message = `Found ${recipeResults.length} recipe ingredients and ${regularResults.length} products`;
    } else if (recipeResults.length > 0) {
      message = `Found recipe ingredients for "${query}"`;
    } else if (regularResults.length > 0) {
      message = `Found ${regularResults.length} products`;
    } else {
      message = `No products found for "${query}"`;
    }

    res.status(200).json({
      products: allResults,
      total: allResults.length,
      query: query,
      category: category,
      hasRecipeResults: recipeResults.length > 0,
      hasRegularResults: regularResults.length > 0,
      message: message
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      products: []
    });
  }
});

// Get all products with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      dietType, 
      minPrice, 
      maxPrice, 
      minRating, 
      sortBy = 'name',
      sortOrder = 'asc',
      isActive = true
    } = req.query;

    // Build filter object
    const filter = { 'availability.isActive': isActive === 'true' };
    
    if (category) filter.category = category;
    if (dietType) filter.dietaryTypes = dietType;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (minRating) filter['ratings.average'] = { $gte: parseFloat(minRating) };

    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalItems: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Recipe generation endpoint (kept for backward compatibility)
router.post('/recipe', authenticateToken, async (req, res) => {
  try {
    const { dishName, numPeople = 2, dietType = 'Veg' } = req.body;

    if (!dishName) {
      return res.status(400).json({ 
        message: 'Dish name is required' 
      });
    }

    console.log(`🔍 Generating recipe for: ${dishName} (${numPeople} people, ${dietType})`);

    // Use recipe service to process the request
    const result = await recipeService.processRecipeRequest(dishName, numPeople, dietType);

    res.status(200).json({
      message: 'Recipe generated successfully',
      ...result
    });

  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ 
      message: 'Error generating recipe',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get product by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;