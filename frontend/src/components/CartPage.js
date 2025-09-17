import React from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  IconButton,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Close, ShoppingCart, Remove } from '@mui/icons-material'; // Added Remove import
import { useNavigate } from 'react-router-dom';

const CartPage = ({ cart, onRemoveFromCart, onAddToCart, userPreferences }) => {
  const navigate = useNavigate();

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <Box sx={{ backgroundColor: '#f7f8fa', minHeight: '100vh' }}>
      <Box sx={{ backgroundColor: '#0071DC', p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Your Cart ({cart.length})
            </Typography>
            <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {cart.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingCart sx={{ fontSize: '4rem', color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add some products to get started
            </Typography>
            <Button
              variant="contained"
              sx={{
                mt: 2,
                backgroundColor: '#FFC220',
                color: '#004c91',
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#e6ae00' },
              }}
              onClick={() => navigate('/')}
            >
              Start Shopping
            </Button>
          </Box>
        ) : (
          <>
            <List sx={{ p: 0 }}>
              {cart.map((item, index) => (
                <ListItem key={index} sx={{ borderBottom: '1px solid #f0f0f0', py: 2, px: 2 }}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {item.name}
                      </Typography>
                      <IconButton size="small" onClick={() => onRemoveFromCart(index)}>
                        <Remove fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      {item.dietaryType && (
                        <Chip 
                          label={item.dietaryType} 
                          size="small" 
                          color="primary" 
                          sx={{ mr: 1, fontSize: '11px' }} 
                        />
                      )}
                      
                      {item.isRecipeIngredient && (
                        <Chip 
                          label="Recipe ingredient" 
                          size="small" 
                          variant="outlined" 
                          color="secondary"
                          sx={{ mr: 1, fontSize: '11px' }}
                        />
                      )}
                      
                      {item.isAutoAdded && (
                        <Chip 
                          label="Auto-added" 
                          size="small" 
                          variant="outlined" 
                          sx={{ fontSize: '11px' }}
                        />
                      )}
                    </Box>
                    
                    {item.recipeName && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', display: 'block', mb: 0.5 }}>
                        For: {item.recipeName}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                        Qty: {item.quantity} {item.unit || ''}
                        {item.servings && ` (${item.servings} servings)`}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>

            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0071DC' }}>
                  ${getTotalPrice()}
                </Typography>
              </Box>
              
              {cart.some(item => item.isRecipeIngredient) && (
                <Box sx={{ mb: 2, p: 1, backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                  <Typography variant="caption" color="primary" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
                    🍳 Recipe ingredients: {cart.filter(item => item.isRecipeIngredient).length} items
                  </Typography>
                </Box>
              )}
              
              <Button 
                variant="contained" 
                fullWidth
                size="large"
                sx={{ 
                  backgroundColor: '#FFC220',
                  color: '#004c91',
                  fontWeight: 'bold',
                  borderRadius: '24px',
                  fontSize: '16px',
                  py: 1.5,
                  '&:hover': { backgroundColor: '#e6ae00' }
                }}
                onClick={() => alert('Checkout feature coming soon!')}
              >
                Checkout
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default CartPage;