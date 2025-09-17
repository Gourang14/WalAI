// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Drawer,
//   Box,
//   Typography,
//   IconButton,
//   List,
//   ListItem,
//   ListItemText,
//   Button,
//   Snackbar,
//   Alert,
//   CircularProgress,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Chip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions
// } from '@mui/material';
// import { Close, Remove, ExpandMore } from '@mui/icons-material';
// import axios from 'axios';

// const Cart = ({ cartItems, onClose, onAddToCart, onRemoveFromCart, onClearCart, userPreferences }) => {
//   const [checkingIngredients, setCheckingIngredients] = useState({});
//   const [showIngredientsDialog, setShowIngredientsDialog] = useState(false);
//   const [selectedProductIngredients, setSelectedProductIngredients] = useState(null);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

//   // Show snackbar notifications
//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({ open: true, message, severity });
//   };

//   // Check ingredient availability for a product
//   const checkProductIngredients = useCallback(async (product) => {
//     if (checkingIngredients[product._id]) return;
    
//     setCheckingIngredients(prev => ({ ...prev, [product._id]: true }));
    
//     try {
//       const token = localStorage.getItem('token');
//       const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/check-ingredients`,
//         {
//           productName: product.name,
//           dietType: userPreferences.dietType || 'vegetarian',
//           servings: 2
//         },
//         { headers }
//       );

//       if (response.data.success) {
//         const ingredientData = response.data.data;
        
//         // Show ingredient details dialog
//         setSelectedProductIngredients({
//           product,
//           ingredients: ingredientData
//         });
//         setShowIngredientsDialog(true);
//       } else {
//         console.error('Ingredient check failed:', response.data.message);
//         showSnackbar('Failed to check ingredient availability', 'error');
//       }
//     } catch (error) {
//       console.error('Failed to check ingredients:', error);
//       showSnackbar('Failed to check ingredient availability', 'error');
//     } finally {
//       setCheckingIngredients(prev => ({ ...prev, [product._id]: false }));
//     }
//   }, [userPreferences.dietType, showSnackbar, checkingIngredients]);

//   return (
//     <Drawer anchor="right" open={true} onClose={onClose}>
//       <Box sx={{ width: 400, height: '100%', display: 'flex', flexDirection: 'column' }}>
//         <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#0071ce' }}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
//               Your Cart ({cartItems.length})
//             </Typography>
//             <IconButton onClick={onClose} sx={{ color: 'white' }}>
//               <Close />
//             </IconButton>
//           </Box>
//         </Box>

//         <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
//           {cartItems.length === 0 ? (
//             <Box sx={{ p: 4, textAlign: 'center' }}>
//               <Typography variant="h6" color="text.secondary">
//                 Your cart is empty
//               </Typography>
//             </Box>
//           ) : (
//             <List sx={{ p: 0 }}>
//               {cartItems.map((item, index) => (
//                 <ListItem key={index} sx={{ borderBottom: '1px solid #f0f0f0', py: 2, px: 2 }}>
//                   <Box sx={{ width: '100%' }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
//                       <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
//                         {item.name}
//                       </Typography>
//                       <IconButton size="small" onClick={() => onRemoveFromCart(index)}>
//                         <Remove fontSize="small" />
//                       </IconButton>
//                     </Box>
                    
//                     <Box sx={{ mb: 1 }}>
//                       {item.dietaryType && (
//                         <Chip 
//                           label={item.dietaryType} 
//                           size="small" 
//                           color="primary" 
//                           sx={{ mr: 1, fontSize: '11px' }} 
//                         />
//                       )}
//                     </Box>
                    
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
//                         Qty: {item.quantity} {item.unit || ''}
//                       </Typography>
//                       <Typography variant="h6" color="primary" sx={{ fontSize: '14px', fontWeight: 'bold' }}>
//                         ${(item.price * item.quantity).toFixed(2)}
//                       </Typography>
//                     </Box>
//                     <Button 
//                       variant="outlined" 
//                       onClick={() => checkProductIngredients(item)}
//                       sx={{ mt: 1 }}
//                     >
//                       Check Ingredients
//                     </Button>
//                   </Box>
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </Box>

//         <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
//           <Button 
//             variant="contained" 
//             fullWidth
//             onClick={onClearCart}
//             sx={{ backgroundColor: '#ffc220', color: '#000', fontWeight: 'bold' }}
//           >
//             Clear Cart
//           </Button>
//         </Box>
//       </Box>

//       {/* Snackbar */}
//       <Snackbar 
//         open={snackbar.open} 
//         autoHideDuration={6000} 
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>

//       {/* Ingredient Availability Dialog */}
//       <Dialog 
//         open={showIngredientsDialog} 
//         onClose={() => setShowIngredientsDialog(false)} 
//         maxWidth="sm" 
//         fullWidth
//         PaperProps={{
//           sx: { borderRadius: '12px' }
//         }}
//       >
//         <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', pb: 1 }}>
//           Ingredient Availability for {selectedProductIngredients?.product.name}
//         </DialogTitle>
//         <DialogContent>
//           {selectedProductIngredients && (
//             <Box>
//               <Typography variant="body2" color="text.secondary">
//                 Available Ingredients: {selectedProductIngredients.ingredients.availableItems.length}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Missing Ingredients: {selectedProductIngredients.ingredients.missingItems.length}
//               </Typography>
//               {selectedProductIngredients.ingredients.missingItems.length > 0 && (
//                 <Typography variant="body2" color="error.main">
//                   Note: {selectedProductIngredients.ingredients.missingItems.join(', ')} are not available in inventory.
//                 </Typography>
//               )}
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions sx={{ p: 2, pt: 0 }}>
//           <Button onClick={() => setShowIngredientsDialog(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>
//     </Drawer>
//   );
// };

// export default Cart;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Close, Remove, ExpandMore } from '@mui/icons-material';
import axios from 'axios';

const Cart = ({ cartItems, onClose, onAddToCart, onRemoveFromCart, onClearCart, userPreferences }) => {
  const [checkingIngredients, setCheckingIngredients] = useState({});
  const [showIngredientsDialog, setShowIngredientsDialog] = useState(false);
  const [selectedProductIngredients, setSelectedProductIngredients] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Show snackbar notifications
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Check ingredient availability for a product
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
          dietType: userPreferences.dietType || 'vegetarian',
          servings: 2
        },
        { headers }
      );

      if (response.data.success) {
        const ingredientData = response.data.data;
        
        // Show ingredient details dialog
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
  }, [userPreferences.dietType, showSnackbar, checkingIngredients]);

  return (
    <Drawer anchor="right" open={true} onClose={onClose}>
      <Box sx={{ width: 400, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#0071ce' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Your Cart ({cartItems.length})
            </Typography>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {cartItems.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Your cart is empty
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {cartItems.map((item, index) => (
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
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                        Qty: {item.quantity} {item.unit || ''}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      onClick={() => checkProductIngredients(item)}
                      sx={{ mt: 1 }}
                    >
                      Check Ingredients
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
          <Button 
            variant="contained" 
            fullWidth
            onClick={onClearCart}
            sx={{ backgroundColor: '#ffc220', color: '#000', fontWeight: 'bold' }}
          >
            Clear Cart
          </Button>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Ingredient Availability Dialog */}
      <Dialog 
        open={showIngredientsDialog} 
        onClose={() => setShowIngredientsDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', pb: 1 }}>
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
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setShowIngredientsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default Cart;