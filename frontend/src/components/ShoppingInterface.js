
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Box,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Drawer,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  ClickAwayListener,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
  InputAdornment
} from '@mui/material';
import { 
  ShoppingCart, 
  Add, 
  Remove,
  Close,
  AccountCircle,
  Menu,
  LocationOn,
  ExpandMore,
  Search,
  FavoriteBorder,
  HelpOutline
} from '@mui/icons-material';
import axios from 'axios';
const ShoppingInterface = ({ 
  user, 
  onLogout, 
  cart, 
  onAddToCart, 
  onRemoveFromCart, 
  onUpdateCartItem, 
  onClearCart,
  userPreferences, 
  onUpdatePreferences,
  deliveryOption,
  onDeliveryOptionChange 
}) => {
  const debounceTimerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  // State Management
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Enhanced features state
  const [showDietaryDialog, setShowDietaryDialog] = useState(false);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedDietType, setSelectedDietType] = useState('');
  const [servingCount, setServingCount] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recipeSearchMode, setRecipeSearchMode] = useState(false);
  
  // New state for ingredient checking
  const [checkingIngredients, setCheckingIngredients] = useState({});
  const [showIngredientsDialog, setShowIngredientsDialog] = useState(false);
  const [selectedProductIngredients, setSelectedProductIngredients] = useState(null);
  const [grocerySearchMode, setGrocerySearchMode] = useState('products');

  // Rotating placeholder texts
  const placeholderTexts = [
    'Search everything at Walmart online and in store',
    'Find fresh produce and pantry staples...',
    'Discover new recipes for dinner...',
    'Shop for household essentials...'
  ];

  const categories = [
    { 
      id: 'food-grocery', 
      name: 'Food & Grocery', 
      icon: '🛒',
      description: 'Fresh produce, pantry essentials, snacks & recipe ingredients'
    },
  ];

  // Rotate placeholder text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCategoryClick = useCallback((category) => {
    if (category.id === 'recipes') {
      setRecipeSearchMode(true);
      setSelectedCategory(category);
    } else {
      setRecipeSearchMode(false);
      setSelectedCategory(category);
      setGrocerySearchMode('products'); 
    }
    setProducts([]);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setMobileMenuOpen(false);
  }, []);

  const handleGrocerySearchModeChange = useCallback((event, newMode) => {
    if (newMode !== null) {
      setGrocerySearchMode(newMode);
      setProducts([]);
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const loadCartRecommendations = useCallback(async () => {
    if (cart.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/cart`,
        {
          cartItems: cart.map(item => ({
            _id: item._id,
            name: item.name,
            category: item.category,
            tags: item.tags,
            price: item.price
          })),
          dietType: userPreferences?.dietType
        },
        { headers }
      );

      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  }, [cart, userPreferences?.dietType]);

  const checkProductIngredients = useCallback(async (product) => {
    if (checkingIngredients[product._id]) return;
    
    setCheckingIngredients(prev => ({ ...prev, [product._id]: true }));
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/check-ingredients`,
        {
          productName: product.name,
          dietType: userPreferences?.dietType || 'vegetarian',
          servings: 2
        },
        { headers }
      );

      if (response.data.success) {
        const ingredientData = response.data.data;
        
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === product._id 
              ? { ...p, ingredientAvailability: ingredientData }
              : p
          )
        );
        
        setSelectedProductIngredients({
          product,
          ingredients: ingredientData
        });
        setShowIngredientsDialog(true);
      } else {
        console.error('Ingredient check failed:', response.data.message);
        showSnackbar('Failed to check ingredient availability', 'error');
      }
    } catch (error) {
      console.error('Failed to check ingredients:', error);
      showSnackbar('Failed to check ingredient availability', 'error');
    } finally {
      setCheckingIngredients(prev => ({ ...prev, [product._id]: false }));
    }
  }, [userPreferences?.dietType, showSnackbar, checkingIngredients]);

  const handleSearchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/search`,
        {
          query: query,
          category: selectedCategory?.id || 'all',
          limit: 8
        },
        { headers }
      );

      const products = response.data.products || response.data || [];
      const suggestionList = Array.isArray(products) ? products.slice(0, 8) : [];
      
      setSuggestions(suggestionList);
      setShowSuggestions(suggestionList.length > 0);
    } catch (error) {
      console.error('Search suggestions failed:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [selectedCategory]);

  const handleRecipeSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      showSnackbar('Please enter a recipe name', 'warning');
      return;
    }

    setLoading(true);
    setShowSuggestions(false);
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recipes/generate`,
        {
          dishName: searchQuery,
          numPeople: userPreferences?.servingSize || 2,
          dietType: userPreferences?.dietType || 'Veg'
        },
        { headers }
      );

      const result = response.data;
      
      if (result.availableItems && result.availableItems.length > 0) {
        result.availableItems.forEach(item => {
          const cartItem = {
            _id: item.inventoryId || `temp_${Date.now()}_${Math.random()}`,
            name: item.name || item.ingredient,
            price: item.price || 2.99,
            quantity: item.requiredQuantity || item.quantity || 1,
            unit: item.unit || 'pieces',
            category: userPreferences?.dietType,
            isRecipeIngredient: true,
            recipeName: result.recipe?.name || searchQuery,
            addedAt: new Date().toISOString(),
            image: item.image || `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/fa5ce1e6-51df-48b0-837f-15c603286cb6.png`
          };
          onAddToCart(cartItem);
        });
        
        showSnackbar(
          `Added ${result.availableItems.length} ingredients for ${result.recipe?.name || searchQuery} to cart!`, 
          'success'
        );
        
        if (result.missingItems && result.missingItems.length > 0) {
          setTimeout(() => {
            showSnackbar(
              `Note: ${result.missingItems.length} ingredients are not available in inventory`, 
              'warning'
            );
          }, 2000);
        }
      } else {
        showSnackbar('No ingredients found for this recipe', 'info');
      }
      
      setSearchQuery('');
      setSuggestions([]);
    } catch (error) {
      console.error('Recipe search failed:', error);
      showSnackbar(
        error.response?.data?.message || 'Recipe search failed. Please try again.', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery, userPreferences?.servingSize, userPreferences?.dietType, onAddToCart, showSnackbar]);

  const handleNLQSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      showSnackbar('Please enter a search query', 'warning');
      return;
    }

    setShowSuggestions(false);

    if (selectedCategory && (recipeSearchMode || (selectedCategory.id === 'food-grocery' && grocerySearchMode === 'recipes'))) {
      handleRecipeSearch();
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const shouldCheckIngredients = selectedCategory?.id === 'food-grocery';

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/search`,
        {
          query: searchQuery,
          category: selectedCategory?.id || 'all',
          filters: {
            dietType: userPreferences?.dietType
          },
          checkIngredients: shouldCheckIngredients
        },
        { headers }
      );

      setProducts(response.data.products || []);
      
      if (!selectedCategory && response.data.products && response.data.products.length > 0) {
        setSelectedCategory(categories[0]);
      }
      
      showSnackbar(
        response.data.message || `Found ${response.data.products?.length || 0} products`, 
        'success'
      );
    } catch (error) {
      console.error('Search failed:', error);
      showSnackbar('Search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, recipeSearchMode, handleRecipeSearch, selectedCategory, userPreferences?.dietType, showSnackbar, grocerySearchMode]);

  const handleSearchInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Ensure focus remains on the input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.length >= 1) {
      debounceTimerRef.current = setTimeout(() => {
        handleSearchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [handleSearchSuggestions]);

  const handleSearchFocus = useCallback(() => {
    if (searchQuery.length >= 1) {
      handleSearchSuggestions(searchQuery);
    }
  }, [searchQuery, handleSearchSuggestions]);

  const handleClickAway = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  const handleAddToCart = useCallback((product) => {
    setCurrentProduct(product);
    setSelectedDietType(userPreferences?.dietType || '');
    setShowDietaryDialog(true);
  }, [userPreferences?.dietType]);

  const quickAddFromSuggestion = useCallback((product) => {
    setShowSuggestions(false);
    handleAddToCart(product);
    setSearchQuery('');
    setSuggestions([]);
  }, [handleAddToCart]);

  useEffect(() => {
    loadCartRecommendations();
  }, [loadCartRecommendations]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleDietarySelection = () => {
    if (!selectedDietType) {
      showSnackbar('Please select a dietary preference', 'warning');
      return;
    }
    setShowDietaryDialog(false);
    setShowQuantityDialog(true);
  };

  const handleQuantitySelection = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recipes/generate`,
          {
            dishName: currentProduct.name,
            numPeople: servingCount,
            dietType: selectedDietType
          },
          { headers }
        );

        const recipeData = response.data;

        const mainItem = {
          _id: currentProduct._id,
          name: currentProduct.name,
          price: currentProduct.price,
          quantity: servingCount,
          category: selectedDietType,
          image: currentProduct.image,
          description: currentProduct.description
        };
        onAddToCart(mainItem);

        if (recipeData.availableItems && recipeData.availableItems.length > 0) {
          recipeData.availableItems.forEach(ingredient => {
            const ingredientItem = {
              _id: ingredient.inventoryId || `ingredient_${Date.now()}_${Math.random()}`,
              name: ingredient.name || ingredient.ingredient,
              price: ingredient.price || 2.99,
              quantity: Math.ceil(ingredient.requiredQuantity || 1),
              category: selectedDietType,
              isRecipeIngredient: true,
              recipeName: currentProduct.name,
              image: ingredient.image || `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f5473ca2-8f32-422f-919a-48c4eacddc59.png`
            };
            onAddToCart(ingredientItem);
          });
          
          showSnackbar(
            `${currentProduct.name} and ${recipeData.availableItems.length} ingredients added to cart!`, 
            'success'
          );
        } else {
          showSnackbar(`${currentProduct.name} added to cart!`, 'success');
        }

      } catch (recipeError) {
        const mainItem = {
          _id: currentProduct._id,
          name: currentProduct.name,
          price: currentProduct.price,
          quantity: servingCount,
          category: selectedDietType,
          image: currentProduct.image,
          description: currentProduct.description
        };
        onAddToCart(mainItem);
        showSnackbar(`${currentProduct.name} added to cart!`, 'success');
      }

      handleDialogReset();

    } catch (error) {
      console.error('Add to cart failed:', error);
      showSnackbar('Failed to add item to cart', 'error');
    }
  };

  const handleDialogReset = () => {
    setShowQuantityDialog(false);
    setShowDietaryDialog(false);
    setCurrentProduct(null);
    setSelectedDietType('');
    setServingCount(1);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  // Updated Walmart-Style Header
  const WalmartStyleHeader = () => (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 1100 }}>
      {/* Top Blue Header */}
      <Box sx={{ 
        backgroundColor: '#004c91', 
        color: 'white',
        padding: '10px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            minHeight: '56px'
          }}>
            {/* Left Section: Logo + Pickup/Delivery + Search */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Box sx={{ mr: 2 }}>
                <img 
                  src= {process.env.PUBLIC_URL + '/WalAI_LOGO.jpg'}
                  alt="WalAI"
                  style={{ width: '40px', height: '40px' }} 
                />
              </Box>
              <Box sx={{ mr: 2, minWidth: '200px' }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select
                    value={deliveryOption || 'pickup'}
                    onChange={onDeliveryOptionChange}
                    variant="outlined"
                    displayEmpty
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                      '& .MuiSvgIcon-root': { color: 'white' },
                      '& .MuiSelect-select': { 
                        padding: '6px 32px 6px 12px',
                        fontSize: '14px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' }
                    }}
                  >
                    <MenuItem value="pickup">Pickup</MenuItem>
                    <MenuItem value="delivery">Delivery</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '12px',
                  display: 'block',
                  mt: 0.5
                }}>
                  Sacramento, 95829 - Sacramento Supercenter
                </Typography>
              </Box>

              <Box sx={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
                <ClickAwayListener onClickAway={handleClickAway}>
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder={placeholderTexts[placeholderIndex]}
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={handleSearchFocus}
                      onKeyPress={(e) => e.key === 'Enter' && handleNLQSearch()}
                      inputRef={searchInputRef}
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          height: '40px',
                          '& fieldset': { 
                            border: 'none',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          },
                          '& input': { 
                            padding: '10px 16px',
                            fontSize: '16px',
                            height: '20px'
                          },
                          '&:hover fieldset': { border: 'none' },
                          '&.Mui-focused fieldset': { border: 'none' }
                        }
                      }}
                    />
                    <IconButton 
                      onClick={handleNLQSearch}
                      disabled={loading}
                      sx={{
                        backgroundColor: '#004c91',
                        color: 'white',
                        borderRadius: '0 8px 8px 0',
                        height: '40px',
                        width: '40px',
                        ml: '-40px',
                        '&:hover': { backgroundColor: '#003366' },
                        '&:disabled': { backgroundColor: '#666' }
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                      ) : (
                        <Search sx={{ fontSize: '24px' }} />
                      )}
                    </IconButton>
                    {showSuggestions && suggestions.length > 0 && (
                      <Paper 
                        sx={{ 
                          position: 'absolute', 
                          top: '100%', 
                          left: 0, 
                          right: 0, 
                          zIndex: 1000, 
                          mt: 1,
                          borderRadius: '8px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          maxHeight: '400px',
                          overflow: 'auto',
                          backgroundColor: '#fff'
                        }}
                      >
                        <Box sx={{ p: 1 }}>
                          <Typography variant="subtitle2" sx={{ 
                            px: 2, 
                            py: 1, 
                            color: '#004c91',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold'
                          }}>
                            Suggested Products
                          </Typography>
                          <List sx={{ p: 0 }}>
                            {suggestions.map((suggestion, index) => (
                              <ListItem 
                                key={index}
                                sx={{ 
                                  cursor: 'pointer',
                                  borderRadius: '8px',
                                  mx: 1,
                                  mb: 0.5,
                                  '&:hover': { 
                                    backgroundColor: '#E6F3FF',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  },
                                  transition: 'all 0.2s ease',
                                  py: 1.5
                                }}
                                onClick={() => {
                                  quickAddFromSuggestion(suggestion);
                                  checkProductIngredients(suggestion);
                                }}
                              >
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  width: '100%',
                                  gap: 2
                                }}>
                                  <Box sx={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    backgroundColor: '#E6F3FF',
                                    flexShrink: 0
                                  }}>
                                    <img 
                                      src={suggestion.image || "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/9d923f87-f9f0-4cfa-8e91-fd9b998acb9b.png"} 
                                      alt={suggestion.name}
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover' 
                                      }}
                                    />
                                  </Box>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 'bold',
                                      fontSize: '14px',
                                      lineHeight: 1.2,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowra</Typography>p',
                                      color: '#004c91'
                                    }}>
                                      {suggestion.name}
                                    </Typography>
                                    {suggestion.description && (
                                      <Typography variant="caption" sx={{ 
                                        color: '#666',
                                        fontSize: '12px',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 1,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                      }}>
                                        {suggestion.description}
                                      </Typography>
                                    )}
                                  </Box>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    flexShrink: 0
                                  }}>
                                    <Chip 
                                      label={`$${suggestion.price?.toFixed(2) || '0.00'}`} 
                                      size="small" 
                                      sx={{
                                        backgroundColor: '#004c91',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '11px'
                                      }}
                                    />
                                    <IconButton 
                                      size="small" 
                                      sx={{ 
                                        color: '#004c91',
                                        backgroundColor: '#E6F3FF',
                                        '&:hover': { backgroundColor: '#cce5ff' }
                                      }}
                                    >
                                      <Add fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                </ClickAwayListener>
              </Box>
            </Box>

            {/* Right Section: Help, Reorder, Account, Cart */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              minWidth: 'fit-content' 
            }}>
              <Box sx={{ 
                textAlign: 'center', 
                cursor: 'pointer', 
                display: { xs: 'none', md: 'block' },
                minWidth: '40px'
              }}>
                <HelpOutline sx={{ fontSize: '24px', color: 'white' }} />
              </Box>

              <Box sx={{ 
                textAlign: 'center', 
                cursor: 'pointer', 
                display: { xs: 'none', md: 'block' },
                minWidth: '80px'
              }}>
                <FavoriteBorder sx={{ fontSize: '24px', color: 'white' }} />
                <Typography variant="caption" sx={{ fontSize: '12px', color: 'white' }}>
                  Reorder My Items
                </Typography>
              </Box>

              <Box sx={{ 
                textAlign: 'center', 
                cursor: 'pointer',
                minWidth: '60px'
              }} onClick={user ? onLogout : () => {}}>
                <AccountCircle sx={{ fontSize: '24px', color: 'white' }} />
                <Typography variant="caption" sx={{ fontSize: '12px', color: 'white' }}>
                  {user ? user.name : 'Sign In'}
                </Typography>
              </Box>

              <Box sx={{ 
                textAlign: 'center', 
                cursor: 'pointer',
                minWidth: '60px'
              }} onClick={() => setShowCart(true)}>
                <Badge 
                  badgeContent={cart.length} 
                  color="error" 
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      top: 2, 
                      right: 2,
                      backgroundColor: '#FF6B35',
                      color: 'white',
                      fontSize: '10px'
                    } 
                  }}
                >
                  <ShoppingCart sx={{ fontSize: '24px', color: 'white' }} />
                </Badge>
                <Typography variant="caption" sx={{ 
                  fontSize: '12px', 
                  color: cart.length > 0 ? '#FFF9C4' : 'white'
                }}>
                  ${getTotalPrice()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Secondary Navigation */}
      <Box sx={{ 
        backgroundColor: 'white', 
        padding: '10px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            fontSize: '14px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            '&::-webkit-scrollbar': { display: 'none' }
          }}>
            <Button
              startIcon={<Menu />}
              sx={{ 
                color: '#004c91', 
                textTransform: 'none',
                fontSize: '14px',
                minWidth: 'auto',
                '&:hover': { backgroundColor: '#E6F3FF' }
              }}
              onClick={() => setMobileMenuOpen(true)}
            >
              Departments
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              Services
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              Get it Fast
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              New Arrivals
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              Deals
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              Dinner Made Easy
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              Pharmacy Delivery
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              Trending
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              Back to School
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              My Items
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              Auto Service
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              Only at Walmart
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              Registry
            </Button>
            <Button sx={{ color: '#004c91', textTransform: 'none', fontSize: '14px', minWidth: 'auto', '&:hover': { backgroundColor: '#E6F3FF' } }}>
              WalAI+
            </Button>
          </Box>
        </Container>
      </Box>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 320, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#004c91' }}>
            Departments
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {categories.map((category) => (
              <ListItem 
                key={category.id} 
                button 
                onClick={() => handleCategoryClick(category)}
                sx={{ py: 1.5 }}
              >
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 2, fontSize: '20px' }}>{category.icon}</Typography>
                      <Typography sx={{ fontWeight: 'bold', color: '#004c91' }}>{category.name}</Typography>
                    </Box>
                  }
                  secondary={category.description}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );

  // No category selected: Enhanced Walmart homepage
  if (!selectedCategory) {
    return (
      <Box sx={{ backgroundColor: '#fff' }}>
        <WalmartStyleHeader />

        {/* Main Content with Promotional Cards */}
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* First Row */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card 
                sx={{ 
                  backgroundColor: '#E6F3FF',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.02)' },
                  transition: 'transform 0.2s'
                }}
                onClick={() => handleCategoryClick(categories[0])}
              >
                <CardMedia
                  component="img"
                  image="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/33d330d6-3e76-48da-b444-033ec1b43752.png"
                  alt="Food & Grocery"
                  sx={{ height: '200px', objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                    Food & Grocery
                  </Typography>
                  <Button 
                    sx={{ 
                      color: '#004c91', 
                      textTransform: 'none',
                      textDecoration: 'underline',
                      p: 0
                    }}
                  >
                    Shop Deals
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  backgroundColor: '#E6F3FF',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.02)' },
                  transition: 'transform 0.2s'
                }}
                onClick={() => handleCategoryClick(categories[0])}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h3" sx={{ color: '#fff', backgroundColor: '#004c91', padding: '8px', borderRadius: '4px', mb: 2 }}>
                    Walmart Deals
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#ff0000', fontWeight: 'bold', mb: 1 }}>
                    July 8-13 Only!
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#000', mb: 2 }}>
                    Last chance for up to 50% off
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      color: '#004c91', 
                      borderColor: '#004c91',
                      borderRadius: '4px',
                      textTransform: 'none'
                    }}
                  >
                    Shop Deals
                  </Button>
                </CardContent>
                <Box sx={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center' }}>
                  <Box sx={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '2px 8px' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#004c91', display: 'inline-block', mr: 1 }} />
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ccc', display: 'inline-block' }} />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card 
                sx={{ 
                  backgroundColor: '#E6F3FF',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.02)' },
                  transition: 'transform 0.2s'
                }}
                onClick={() => handleCategoryClick(categories[0])}
              >
                <CardMedia
                  component="img"
                  image="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/41bbe906-0527-429d-8879-d9a5785d0cc2.png"
                  alt="TVs"
                  sx={{ height: '200px', objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                    TVs up to 25% off
                  </Typography>
                  <Button 
                    sx={{ 
                      color: '#004c91', 
                      textTransform: 'none',
                      textDecoration: 'underline',
                      p: 0
                    }}
                  >
                    Shop Deals
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Second Row */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  backgroundColor: '#E6F3FF',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.02)' },
                  transition: 'transform 0.2s'
                }}
                onClick={() => handleCategoryClick(categories[0])}
              >
                <CardMedia
                  component="img"
                  image="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/6e0ce53c-6c1e-48e7-a9d5-e7894765689c.png"
                  alt="Cooking & dining"
                  sx={{ height: '150px', objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                    Cooking & dining up to 40% off
                  </Typography>
                  <Button 
                    sx={{ 
                      color: '#004c91', 
                      textTransform: 'none',
                      textDecoration: 'underline',
                      p: 0
                    }}
                  >
                    Shop Deals
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  backgroundColor: '#E6F3FF',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.02)' },
                  transition: 'transform 0.2s'
                }}
                onClick={() => handleCategoryClick(categories[0])}
              >
                <CardMedia
                  component="img"
                  image="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ff81a3fc-0a19-4f11-b4ce-1b5b916b0a17.png"
                  alt="Womens"
                  sx={{ height: '150px', objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                    Dresses
                  </Typography>
                  <Button 
                    sx={{ 
                      color: '#004c91', 
                      textTransform: 'none',
                      textDecoration: 'underline',
                      p: 0
                    }}
                  >
                    Shop Deals
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  backgroundColor: '#FFF9C4',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.02)' },
                  transition: 'transform 0.2s'
                }}
                onClick={() => handleCategoryClick(categories[0])}
              >
                <CardMedia
                  component="img"
                  image="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/276cb09d-1c00-4be5-a90e-b9a22950ccff.png"
                  alt="Baby toys"
                  sx={{ height: '150px', objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                    Up to 50% off
                  </Typography>
                  <Button 
                    sx={{ 
                      color: '#004c91', 
                      textTransform: 'none',
                      textDecoration: 'underline',
                      p: 0
                    }}
                  >
                    Shop now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Shop by Category */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#004c91' }}>
              Shop by Category
            </Typography>
            <Grid container spacing={2}>
              {[
                { name: 'Fresh Produce', icon: '🥕', color: '#004c91' },
                { name: 'Pantry Staples', icon: '🥫', color: '#004c91' },
                { name: 'Snacks & Beverages', icon: '🥤', color: '#004c91' },
                { name: 'Household Essentials', icon: '🧼', color: '#004c91' }
              ].map((cat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Card 
                    sx={{ 
                      backgroundColor: '#E6F3FF',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      textAlign: 'center', 
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.02)' },
                      transition: 'transform 0.2s'
                    }}
                    onClick={() => handleCategoryClick(categories[0])}
                  >
                    <CardContent sx={{ py: 3 }}>
                      <Typography sx={{ fontSize: '40px', mb: 2 }}>{cat.icon}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: cat.color }}>
                        {cat.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Trending Deals */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#004c91' }}>
              Trending Deals
            </Typography>
            <Grid container spacing={2}>
              {[
                { name: 'Organic Avocados', price: 1.99, image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/83999ac7-5af7-471b-b383-88f46b86c281.png' },
                { name: 'Whole Grain Bread', price: 2.49, image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/83999ac7-5af7-471b-b383-88f46b86c281.png' },
                { name: 'Almond Milk', price: 3.29, image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/83999ac7-5af7-471b-b383-88f46b86c281.png' },
                { name: 'Organic Pasta', price: 1.79, image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/83999ac7-5af7-471b-b383-88f46b86c281.png' }
              ].map((deal, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Card 
                    sx={{ 
                      backgroundColor: '#E6F3FF',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.02)' },
                      transition: 'transform 0.2s'
                    }}
                    onClick={() => handleAddToCart({ name: deal.name, price: deal.price, image: deal.image })}
                  >
                    <CardMedia
                      component="img"
                      image={deal.image}
                      alt={deal.name}
                      sx={{ height: '150px', objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
                        {deal.name}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#004c91', fontWeight: 'bold' }}>
                        ${deal.price.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    );
  }

  // Shopping Interface View
  return (
<>
  <Box sx={{ backgroundColor: '#fff' }}>
    <WalmartStyleHeader />

    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button 
          onClick={() => setSelectedCategory(null)}
          startIcon={<Close />}
          sx={{ 
            color: '#004c91', 
            mb: 1,
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Back to Home
        </Button>
        <Typography variant="body2" color="text.secondary">
          Home / {selectedCategory.name}
        </Typography>
      </Box>

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ 
          fontWeight: 'bold',
          color: '#004c91',
          fontSize: { xs: '2rem', md: '3rem' }
        }}>
          {selectedCategory.icon} {selectedCategory.name}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ 
          fontSize: { xs: '1rem', md: '1.25rem' },
          mb: 2
        }}>
          {selectedCategory.description}
        </Typography>
      </Box>

      {selectedCategory.id === 'food-grocery' && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <ToggleButtonGroup
            value={grocerySearchMode}
            exclusive
            onChange={handleGrocerySearchModeChange}
            aria-label="grocery search mode"
            sx={{
              '& .MuiToggleButton-root': {
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 'bold',
                padding: '8px 24px',
                border: '2px solid #004c91',
                color: '#004c91',
                '&.Mui-selected': {
                  backgroundColor: '#004c91',
                  color: 'white'
                }
              }
            }}
          >
            <ToggleButton value="products" aria-label="products">
              🛍️ Products
            </ToggleButton>
            <ToggleButton value="recipes" aria-label="recipes">
              🍳 Recipes
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {products.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 'bold', 
            mb: 3,
            color: '#004c91',
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}>
            Search Results ({products.length} items)
          </Typography>
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card sx={{ 
                  backgroundColor: '#E6F3FF',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  '&:hover': { 
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <CardMedia
                    component="img"
                    image={product.image || "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/83999ac7-5af7-471b-b383-88f46b86c281.png"}
                    alt={product.name}
                    sx={{ height: '200px', objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontWeight: 'bold', 
                      fontSize: '16px',
                      lineHeight: 1.3,
                      color: '#004c91'
                    }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 2, 
                      fontSize: '14px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {product.tags?.slice(0, 2).map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '11px', color: '#004c91', borderColor: '#004c91' }}
                        />
                      ))}
                    </Box>

                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      mb: 2,
                      fontSize: '18px',
                      color: '#004c91'
                    }}>
                      ${product.price?.toFixed(2) || '0.00'}
                    </Typography>

                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => handleAddToCart(product)}
                      startIcon={<Add />}
                      sx={{ 
                        backgroundColor: '#FFF9C4',
                        color: '#004c91',
                        borderRadius: '24px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        py: 1,
                        '&:hover': { backgroundColor: '#fff0a3' }
                      }}
                    >
                      Add to cart
                    </Button>

                    {product.ingredientAvailability && (
                      <Box sx={{ mt: 2 }}>
                        <Accordion>
                          <AccordionSummary 
                            expandIcon={<ExpandMore />}
                            sx={{ minHeight: '40px' }}
                          >
                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#004c91' }}>
                              Ingredient Availability
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0 }}>
                            {product.ingredientAvailability.hasIngredients ? (
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                  Available: {product.ingredientAvailability.availableItems.length} | 
                                  Missing: {product.ingredientAvailability.missingItems.length}
                                </Typography>
                                {product.ingredientAvailability.missingItems.length > 0 && (
                                  <Typography variant="body2" color="error.main" sx={{ fontSize: '12px' }}>
                                    Missing: {product.ingredientAvailability.missingItems.join(', ')}
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="error.main" sx={{ fontSize: '12px' }}>
                                No ingredients available
                              </Typography>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {searchQuery && products.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            No products found for "{searchQuery}"
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try searching with different keywords or browse our categories
          </Typography>
        </Box>
      )}

      {loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} sx={{ color: '#004c91', mb: 2 }} />
          <Typography variant="h5" color="text.secondary">
            Searching products...
          </Typography>
        </Box>
      )}
    </Container>
  </Box>
  {/* The rest of your dialogs, drawers, and snackbars remain unchanged */}
  <Dialog 
    open={showDietaryDialog} 
    onClose={() => setShowDietaryDialog(false)} 
    maxWidth="sm" 
    fullWidth
    PaperProps={{
      sx: { borderRadius: '16px' }
    }}
  >
    <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#004c91' }}>
      Choose Your Dietary Preference
    </DialogTitle>
    <DialogContent>
      <Box sx={{ py: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: '#004c91' }}>Select Dietary Type</InputLabel>
          <Select
            value={selectedDietType}
            onChange={(e) => setSelectedDietType(e.target.value)}
            label="Select Dietary Type"
            sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#004c91' } }}
          >
            <MenuItem value="vegan">🌱 Vegan</MenuItem>
            <MenuItem value="vegetarian">🥕 Vegetarian</MenuItem>
            <MenuItem value="non-vegetarian">🍖 Non-Vegetarian</MenuItem>
          </Select>
        </FormControl>
        
        {currentProduct && (
          <Box sx={{ p: 2, backgroundColor: '#E6F3FF', borderRadius: '8px' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#004c91' }}>
              {currentProduct.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We'll automatically add the right ingredients based on your dietary preference
            </Typography>
          </Box>
        )}
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={() => setShowDietaryDialog(false)} sx={{ color: '#004c91' }}>Cancel</Button>
      <Button 
        onClick={handleDietarySelection} 
        variant="contained"
        disabled={!selectedDietType}
        sx={{ backgroundColor: '#004c91', borderRadius: '24px', '&:hover': { backgroundColor: '#003366' } }}
      >
        Continue
      </Button>
    </DialogActions>
  </Dialog>

  <Dialog 
    open={showQuantityDialog} 
    onClose={() => setShowQuantityDialog(false)} 
    maxWidth="sm" 
    fullWidth
    PaperProps={{
      sx: { borderRadius: '16px' }
    }}
  >
    <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#004c91' }}>
      How Many Servings?
    </DialogTitle>
    <DialogContent>
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#004c91' }}>
          For how many people?
        </Typography>
        <TextField
          type="number"
          value={servingCount}
          onChange={(e) => setServingCount(Math.max(1, parseInt(e.target.value) || 1))}
          InputProps={{ inputProps: { min: 1, max: 20 } }}
          sx={{ mt: 2, width: '120px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#004c91' } }}
          size="large"
        />
        
        {currentProduct && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#E6F3FF', borderRadius: '8px' }}>
            <Typography variant="body1" gutterBottom sx={{ color: '#004c91' }}>
              <strong>{currentProduct.name}</strong> ({selectedDietType})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingredients will be calculated for {servingCount} serving{servingCount > 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={() => setShowQuantityDialog(false)} sx={{ color: '#004c91' }}>Cancel</Button>
      <Button 
        onClick={handleQuantitySelection} 
        variant="contained"
        sx={{ backgroundColor: '#004c91', borderRadius: '24px', '&:hover': { backgroundColor: '#003366' } }}
      >
        Add to Cart
      </Button>
    </DialogActions>
  </Dialog>

  <Drawer anchor="right" open={showCart} onClose={() => setShowCart(false)}>
    <Box sx={{ width: { xs: '100vw', sm: 400 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#004c91' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Your Cart ({cart.length})
          </Typography>
          <IconButton onClick={() => setShowCart(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {cart.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <ShoppingCart sx={{ fontSize: '4rem', color: '#E6F3FF', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add some products to get started
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {cart.map((item, index) => (
              <ListItem key={index} sx={{ borderBottom: '1px solid #E6F3FF', py: 2, px: 2 }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: '#004c91'
                    }}>
                      {item.name}
                    </Typography>
                    <IconButton size="small" onClick={() => onRemoveFromCart(index)} sx={{ color: '#004c91' }}>
                      <Remove fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    {item.dietaryType && (
                      <Chip 
                        label={item.dietaryType} 
                        size="small" 
                        color="primary" 
                        sx={{ mr: 1, fontSize: '11px', backgroundColor: '#004c91' }} 
                      />
                    )}
                    
                    {item.isRecipeIngredient && (
                      <Chip 
                        label="Recipe ingredient" 
                        size="small" 
                        variant="outlined" 
                        color="secondary"
                        sx={{ mr: 1, fontSize: '11px', color: '#004c91', borderColor: '#004c91' }}
                      />
                    )}
                    
                    {item.isAutoAdded && (
                      <Chip 
                        label="Auto-added" 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '11px', color: '#004c91', borderColor: '#004c91' }}
                      />
                    )}
                  </Box>
                  
                  {item.recipeName && (
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      fontSize: '10px',
                      display: 'block',
                      mb: 0.5
                    }}>
                      For: {item.recipeName}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                      Qty: {item.quantity} {item.unit || ''}
                      {item.servings && ` (${item.servings} servings)`}
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 'bold', color: '#004c91' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        )}

        {recommendations.length > 0 && (
          <Box sx={{ p: 2, backgroundColor: '#E6F3FF' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontSize: '16px', color: '#004c91' }}>
              Recommended for you
            </Typography>
            <Grid container spacing={1}>
              {recommendations.slice(0, 4).map((rec, index) => (
                <Grid item xs={6} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      '&:hover': { backgroundColor: '#f0f0f0' }
                    }} 
                    onClick={() => handleAddToCart(rec.item || rec)}
                  >
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="caption" sx={{ 
                        fontWeight: 'bold',
                        fontSize: '11px',
                        color: '#004c91',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {rec.name || rec.item?.name}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '11px', color: '#004c91' }}>
                        ${rec.price || rec.item?.price}
                      </Typography>
                      {rec.reason && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '10px' }}>
                          {rec.reason}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {cart.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#004c91' }}>
              Total:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#004c91' }}>
              ${getTotalPrice()}
            </Typography>
          </Box>
          
          {cart.some(item => item.isRecipeIngredient) && (
            <Box sx={{ mb: 2, p: 1, backgroundColor: '#E6F3FF', borderRadius: '4px' }}>
              <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 'bold', color: '#004c91' }}>
                🍳 Recipe ingredients: {cart.filter(item => item.isRecipeIngredient).length} items
              </Typography>
            </Box>
          )}
          
          <Button 
            variant="contained" 
            fullWidth
            size="large"
            sx={{ 
              backgroundColor: '#004c91',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '24px',
              fontSize: '16px',
              py: 1,
              '&:hover': { backgroundColor: '#003366' }
            }}
            onClick={() => showSnackbar('Checkout feature coming soon!', 'info')}
          >
            Checkout
          </Button>
        </Box>
      )}
    </Box>
  </Drawer>

  <Snackbar 
    open={snackbar.open} 
    autoHideDuration={6000} 
    onClose={() => setSnackbar({ ...snackbar, open: false })}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  >
    <Alert 
      onClose={() => setSnackbar({ ...snackbar, open: false })} 
      severity={snackbar.severity}
      sx={{ width: '100%' }}
    >
      {snackbar.message}
    </Alert>
  </Snackbar>

  <Dialog 
    open={showIngredientsDialog} 
    onClose={() => setShowIngredientsDialog(false)} 
    maxWidth="sm" 
    fullWidth
    PaperProps={{
      sx: { borderRadius: '16px' }
    }}
  >
    <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#004c91' }}>
      Ingredient Availability for {selectedProductIngredients?.product.name}
    </DialogTitle>
    <DialogContent>
      {selectedProductIngredients && (
        <Box>
          <Typography variant="body2" color="text.secondary">
            Available Ingredients: {selectedProductIngredients.ingredients.availableItems.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Missing Ingredients: {selectedProductIngredients.ingredients.missingItems.length}
          </Typography>
          {selectedProductIngredients.ingredients.missingItems.length > 0 && (
            <Typography variant="body2" color="error.main">
              Note: {selectedProductIngredients.ingredients.missingItems.join(', ')} are not available in inventory.
            </Typography>
          )}
        </Box>
      )}
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button 
        onClick={() => setShowIngredientsDialog(false)}
        sx={{ borderRadius: '24px', color: '#004c91' }}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
</>
  );
};

export default ShoppingInterface;