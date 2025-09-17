// import React, { useState } from 'react';
// import {
//   TextField,
//   Button,
//   Container,
//   Paper,
//   Typography,
//   Box,
//   Alert,
//   CircularProgress,
//   InputAdornment,
//   IconButton,
//   Divider,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Checkbox,
//   FormControlLabel,
//   Link,
//   Card,
//   CardContent
// } from '@mui/material';
// import {
//   Visibility,
//   VisibilityOff,
//   Email,
//   Lock,
//   Person,
//   ShoppingCart,
//   Restaurant,
//   LocalGroceryStore,
//   SmartToy
// } from '@mui/icons-material';
// import axios from 'axios';

// const Login = ({ onLogin }) => {
//   const [formData, setFormData] = useState({ 
//     email: '', 
//     password: '', 
//     name: '',
//     preferences: {
//       dietType: 'Veg',
//       servingSize: 2,
//       allergies: [],
//       cuisinePreferences: [],
//       budgetRange: {
//         min: 0,
//         max: 1000
//       },
//       cookingTime: 'any'
//     }
//   });
//   const [isRegister, setIsRegister] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    
//     // Prepare payload based on mode
//     const payload = isRegister ? formData : {
//       email: formData.email,
//       password: formData.password
//     };
    
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${endpoint}`, 
//         payload,
//         {
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       // Store authentication data
//       if (response.data.token) {
//         localStorage.setItem('token', response.data.token);
//         localStorage.setItem('user', JSON.stringify(response.data.user));
        
//         if (rememberMe) {
//           localStorage.setItem('rememberMe', 'true');
//         }

//         setSuccess(isRegister ? 'Account created successfully!' : 'Welcome back!');
        
//         // Delay to show success message
//         setTimeout(() => {
//           onLogin(response.data.user, response.data.token);
//         }, 1000);
//       } else {
//         throw new Error('No token received');
//       }

//     } catch (error) {
//       console.error('Authentication error:', error);
      
//       if (error.response?.data?.errors) {
//         // Handle validation errors
//         setError(error.response.data.errors.join(', '));
//       } else {
//         setError(error.response?.data?.message || 'Authentication failed. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (field, value) => {
//     if (field.includes('.')) {
//       const [parent, child] = field.split('.');
//       setFormData(prev => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value
//         }
//       }));
//     } else {
//       setFormData(prev => ({ ...prev, [field]: value }));
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const switchMode = () => {
//     setIsRegister(!isRegister);
//     setError('');
//     setSuccess('');
//     setFormData({ 
//       email: '', 
//       password: '', 
//       name: '',
//       preferences: {
//         dietType: 'Veg',
//         servingSize: 2,
//         allergies: [],
//         cuisinePreferences: [],
//         budgetRange: {
//           min: 0,
//           max: 1000
//         },
//         cookingTime: 'any'
//       }
//     });
//   };

//   // Demo login function
//   const handleDemoLogin = async () => {
//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, 
//         {
//           email: 'demo@walai.com',
//           password: 'demo123'
//         }
//       );
      
//       if (response.data.token) {
//         localStorage.setItem('token', response.data.token);
//         localStorage.setItem('user', JSON.stringify(response.data.user));
        
//         setSuccess('Demo login successful!');
//         setTimeout(() => {
//           onLogin(response.data.user, response.data.token);
//         }, 1000);
//       }
//     } catch (error) {
//       // If demo account doesn't exist, create it
//       try {
//         const createResponse = await axios.post(
//           `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`,
//           {
//             name: 'Demo User',
//             email: 'demo@walai.com',
//             password: 'demo123',
//             preferences: {
//               dietType: 'Veg',
//               servingSize: 2,
//               allergies: [],
//               cuisinePreferences: ['italian', 'american']
//             }
//           }
//         );
        
//         if (createResponse.data.token) {
//           localStorage.setItem('token', createResponse.data.token);
//           localStorage.setItem('user', JSON.stringify(createResponse.data.user));
          
//           setSuccess('Demo account created and logged in!');
//           setTimeout(() => {
//             onLogin(createResponse.data.user, createResponse.data.token);
//           }, 1000);
//         }
//       } catch (createError) {
//         setError('Demo login failed. Please try manual login.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ 
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       display: 'flex',
//       alignItems: 'center',
//       py: 4
//     }}>
//       <Container maxWidth="md">
//         <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          
//           {/* Left Side - Branding */}
//           <Box sx={{ 
//             flex: 1, 
//             color: 'white', 
//             display: { xs: 'none', md: 'block' } 
//           }}>
//             <Typography variant="h2" fontWeight="bold" gutterBottom>
//               Wal AI
//             </Typography>
//             <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
//               Smart Grocery Shopping with AI
//             </Typography>
            
//             <Box sx={{ mb: 4 }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <SmartToy sx={{ mr: 2, fontSize: 30 }} />
//                 <Typography variant="h6">AI-Powered Recipe Search</Typography>
//               </Box>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <Restaurant sx={{ mr: 2, fontSize: 30 }} />
//                 <Typography variant="h6">Intelligent Meal Planning</Typography>
//               </Box>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <LocalGroceryStore sx={{ mr: 2, fontSize: 30 }} />
//                 <Typography variant="h6">Smart Shopping Lists</Typography>
//               </Box>
//             </Box>

//             <Card sx={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
//               <CardContent>
//                 <Typography variant="body1" sx={{ color: 'white', fontStyle: 'italic' }}>
//                   "Just search for any dish and we'll automatically add all the ingredients to your cart!"
//                 </Typography>
//                 <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, display: 'block' }}>
//                   - Try searching "Chicken Pasta" or "White Pasta"
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Box>

//           {/* Right Side - Login Form */}
//           <Box sx={{ flex: 1, maxWidth: 400 }}>
//             <Paper elevation={10} sx={{ 
//               p: 4, 
//               borderRadius: 3,
//               background: 'rgba(255,255,255,0.95)',
//               backdropFilter: 'blur(10px)'
//             }}>
              
//               {/* Header */}
//               <Box sx={{ textAlign: 'center', mb: 3 }}>
//                 <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
//                 <Typography variant="h4" fontWeight="bold" color="primary">
//                   Wal AI
//                 </Typography>
//                 <Typography variant="h6" color="text.secondary">
//                   {isRegister ? 'Create Your Account' : 'Welcome Back'}
//                 </Typography>
//               </Box>

//               {/* Alerts */}
//               {error && (
//                 <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
//                   {error}
//                 </Alert>
//               )}
//               {success && (
//                 <Alert severity="success" sx={{ mb: 2 }}>
//                   {success}
//                 </Alert>
//               )}

//               {/* Form */}
//               <form onSubmit={handleSubmit}>
//                 {isRegister && (
//                   <TextField
//                     fullWidth
//                     label="Full Name"
//                     margin="normal"
//                     value={formData.name}
//                     onChange={(e) => handleInputChange('name', e.target.value)}
//                     required
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <Person color="action" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 )}

//                 <TextField
//                   fullWidth
//                   label="Email Address"
//                   type="email"
//                   margin="normal"
//                   value={formData.email}
//                   onChange={(e) => handleInputChange('email', e.target.value)}
//                   required
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <Email color="action" />
//                       </InputAdornment>
//                     ),
//                   }}
//                 />

//                 <TextField
//                   fullWidth
//                   label="Password"
//                   type={showPassword ? 'text' : 'password'}
//                   margin="normal"
//                   value={formData.password}
//                   onChange={(e) => handleInputChange('password', e.target.value)}
//                   required
//                   helperText={isRegister ? "Minimum 6 characters" : ""}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <Lock color="action" />
//                       </InputAdornment>
//                     ),
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <IconButton onClick={togglePasswordVisibility} edge="end">
//                           {showPassword ? <VisibilityOff /> : <Visibility />}
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                   }}
//                 />

//                 {/* Registration Preferences */}
//                 {isRegister && (
//                   <Box sx={{ mt: 2 }}>
//                     <Typography variant="subtitle2" gutterBottom color="text.secondary">
//                       Preferences (Optional)
//                     </Typography>
                    
//                     <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
//                       <FormControl fullWidth size="small">
//                         <InputLabel>Diet Type</InputLabel>
//                         <Select
//                           value={formData.preferences.dietType}
//                           onChange={(e) => handleInputChange('preferences.dietType', e.target.value)}
//                           label="Diet Type"
//                         >
//                           <MenuItem value="Veg">🥕 Vegetarian</MenuItem>
//                           <MenuItem value="Non-Veg">🍖 Non-Vegetarian</MenuItem>
//                           <MenuItem value="Vegan">🌱 Vegan</MenuItem>
//                         </Select>
//                       </FormControl>

//                       <FormControl size="small" sx={{ minWidth: 120 }}>
//                         <InputLabel>Serving Size</InputLabel>
//                         <Select
//                           value={formData.preferences.servingSize}
//                           onChange={(e) => handleInputChange('preferences.servingSize', e.target.value)}
//                           label="Serving Size"
//                         >
//                           <MenuItem value={1}>1 person</MenuItem>
//                           <MenuItem value={2}>2 people</MenuItem>
//                           <MenuItem value={4}>4 people</MenuItem>
//                           <MenuItem value={6}>6 people</MenuItem>
//                           <MenuItem value={8}>8 people</MenuItem>
//                         </Select>
//                       </FormControl>
//                     </Box>

//                     <FormControl fullWidth size="small" sx={{ mb: 1 }}>
//                       <InputLabel>Cooking Time Preference</InputLabel>
//                       <Select
//                         value={formData.preferences.cookingTime}
//                         onChange={(e) => handleInputChange('preferences.cookingTime', e.target.value)}
//                         label="Cooking Time Preference"
//                       >
//                         <MenuItem value="quick">⚡ Quick (Under 30 min)</MenuItem>
//                         <MenuItem value="medium">🕐 Medium (30-60 min)</MenuItem>
//                         <MenuItem value="long">🕑 Long (Over 60 min)</MenuItem>
//                         <MenuItem value="any">🍳 Any Duration</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 )}

//                 {/* Remember Me */}
//                 {!isRegister && (
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={rememberMe}
//                         onChange={(e) => setRememberMe(e.target.checked)}
//                         color="primary"
//                       />
//                     }
//                     label="Remember me"
//                     sx={{ mt: 1 }}
//                   />
//                 )}

//                 {/* Submit Button */}
//                 <Button
//                   type="submit"
//                   fullWidth
//                   variant="contained"
//                   size="large"
//                   disabled={loading}
//                   sx={{ 
//                     mt: 3, 
//                     mb: 2, 
//                     py: 1.5,
//                     borderRadius: 2,
//                     background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
//                     '&:hover': {
//                       background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
//                     }
//                   }}
//                 >
//                   {loading ? (
//                     <CircularProgress size={24} color="inherit" />
//                   ) : (
//                     isRegister ? 'Create Account' : 'Sign In'
//                   )}
//                 </Button>

//                 <Divider sx={{ my: 2 }}>
//                   <Typography variant="body2" color="text.secondary"> OR
//                   </Typography>
//                 </Divider>

//                 {/* Switch Mode */}
//                 <Box sx={{ textAlign: 'center' }}>
//                   <Typography variant="body2" color="text.secondary">
//                     {isRegister ? 'Already have an account?' : "Don't have an account?"}
//                   </Typography>
//                   <Link
//                     component="button"
//                     type="button"
//                     variant="body2"
//                     onClick={switchMode}
//                     sx={{ 
//                       textDecoration: 'none',
//                       fontWeight: 'bold',
//                       '&:hover': { textDecoration: 'underline' }
//                     }}
//                   >
//                     {isRegister ? 'Sign In' : 'Sign Up'}
//                   </Link>
//                 </Box>

//                 {/* Demo Account */}
//                 <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
//                   <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
//                     Demo Account:
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     Email: demo@walai.com | Password: demo123
//                   </Typography>
//                 </Box>
//               </form>
//             </Paper>
//           </Box>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default Login;

// import React, { useState } from 'react';
// import {
//   TextField,
//   Button,
//   Container,
//   Paper,
//   Typography,
//   Box,
//   Alert,
//   CircularProgress,
//   InputAdornment,
//   IconButton,
//   Divider,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Checkbox,
//   FormControlLabel,
//   Link,
//   Card,
//   CardContent
// } from '@mui/material';
// import {
//   Visibility,
//   VisibilityOff,
//   Email,
//   Lock,
//   Person,
//   ShoppingCart,
//   Restaurant,
//   LocalGroceryStore,
//   SmartToy
// } from '@mui/icons-material';
// import axios from 'axios';

// const Login = ({ onLogin }) => {
//   const [formData, setFormData] = useState({ 
//     email: '', 
//     password: '', 
//     name: '',
//     preferences: {
//       dietType: 'Veg',
//       servingSize: 2,
//       allergies: [],
//       cuisinePreferences: [],
//       budgetRange: {
//         min: 0,
//         max: 1000
//       },
//       cookingTime: 'any'
//     }
//   });
//   const [isRegister, setIsRegister] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    
//     // Prepare payload based on mode
//     const payload = isRegister ? formData : {
//       email: formData.email,
//       password: formData.password
//     };
    
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${endpoint}`, 
//         payload,
//         {
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       // Store authentication data
//       if (response.data.token) {
//         localStorage.setItem('token', response.data.token);
//         localStorage.setItem('user', JSON.stringify(response.data.user));
        
//         if (rememberMe) {
//           localStorage.setItem('rememberMe', 'true');
//         }

//         setSuccess(isRegister ? 'Account created successfully!' : 'Welcome back!');
        
//         // Delay to show success message
//         setTimeout(() => {
//           onLogin(response.data.user, response.data.token);
//         }, 1000);
//       } else {
//         throw new Error('No token received');
//       }

//     } catch (error) {
//       console.error('Authentication error:', error);
      
//       if (error.response?.data?.errors) {
//         // Handle validation errors
//         setError(error.response.data.errors.join(', '));
//       } else {
//         setError(error.response?.data?.message || 'Authentication failed. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (field, value) => {
//     if (field.includes('.')) {
//       const [parent, child] = field.split('.');
//       setFormData(prev => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value
//         }
//       }));
//     } else {
//       setFormData(prev => ({ ...prev, [field]: value }));
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const switchMode = () => {
//     setIsRegister(!isRegister);
//     setError('');
//     setSuccess('');
//     setFormData({ 
//       email: '', 
//       password: '', 
//       name: '',
//       preferences: {
//         dietType: 'Veg',
//         servingSize: 2,
//         allergies: [],
//         cuisinePreferences: [],
//         budgetRange: {
//           min: 0,
//           max: 1000
//         },
//         cookingTime: 'any'
//       }
//     });
//   };

//   // Demo login function
//   const handleDemoLogin = async () => {
//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, 
//         {
//           email: 'demo@walai.com',
//           password: 'demo123'
//         }
//       );
      
//       if (response.data.token) {
//         localStorage.setItem('token', response.data.token);
//         localStorage.setItem('user', JSON.stringify(response.data.user));
        
//         setSuccess('Demo login successful!');
//         setTimeout(() => {
//           onLogin(response.data.user, response.data.token);
//         }, 1000);
//       }
//     } catch (error) {
//       // If demo account doesn't exist, create it
//       try {
//         const createResponse = await axios.post(
//           `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`,
//           {
//             name: 'Demo User',
//             email: 'demo@walai.com',
//             password: 'demo123',
//             preferences: {
//               dietType: 'Veg',
//               servingSize: 2,
//               allergies: [],
//               cuisinePreferences: ['italian', 'american']
//             }
//           }
//         );
        
//         if (createResponse.data.token) {
//           localStorage.setItem('token', createResponse.data.token);
//           localStorage.setItem('user', JSON.stringify(createResponse.data.user));
          
//           setSuccess('Demo account created and logged in!');
//           setTimeout(() => {
//             onLogin(createResponse.data.user, createResponse.data.token);
//           }, 1000);
//         }
//       } catch (createError) {
//         setError('Demo login failed. Please try manual login.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ 
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       display: 'flex',
//       alignItems: 'center',
//       py: 4
//     }}>
//       <Container maxWidth="md">
//         <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          
//           {/* Left Side - Branding */}
//           <Box sx={{ 
//             flex: 1, 
//             color: 'white', 
//             display: { xs: 'none', md: 'block' } 
//           }}>
//             <Typography variant="h2" fontWeight="bold" gutterBottom>
//               Wal AI
//             </Typography>
//             <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
//               Smart Grocery Shopping with AI
//             </Typography>
            
//             <Box sx={{ mb: 4 }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <SmartToy sx={{ mr: 2, fontSize: 30 }} />
//                 <Typography variant="h6">AI-Powered Recipe Search</Typography>
//               </Box>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <Restaurant sx={{ mr: 2, fontSize: 30 }} />
//                 <Typography variant="h6">Intelligent Meal Planning</Typography>
//               </Box>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <LocalGroceryStore sx={{ mr: 2, fontSize: 30 }} />
//                 <Typography variant="h6">Smart Shopping Lists</Typography>
//               </Box>
//             </Box>

//             <Card sx={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
//               <CardContent>
//                 <Typography variant="body1" sx={{ color: 'white', fontStyle: 'italic' }}>
//                   "Just search for any dish and we'll automatically add all the ingredients to your cart!"
//                 </Typography>
//                 <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, display: 'block' }}>
//                   - Try searching "Chicken Pasta" or "White Pasta"
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Box>

//           {/* Right Side - Login Form */}
//           <Box sx={{ flex: 1, maxWidth: 400 }}>
//             <Paper elevation={10} sx={{ 
//               p: 4, 
//               borderRadius: 3,
//               background: 'rgba(255,255,255,0.95)',
//               backdropFilter: 'blur(10px)'
//             }}>
              
//               {/* Header */}
//               <Box sx={{ textAlign: 'center', mb: 3 }}>
//                 <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
//                 <Typography variant="h4" fontWeight="bold" color="primary">
//                   Wal AI
//                 </Typography>
//                 <Typography variant="h6" color="text.secondary">
//                   {isRegister ? 'Create Your Account' : 'Welcome Back'}
//                 </Typography>
//               </Box>

//               {/* Alerts */}
//               {error && (
//                 <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
//                   {error}
//                 </Alert>
//               )}
//               {success && (
//                 <Alert severity="success" sx={{ mb: 2 }}>
//                   {success}
//                 </Alert>
//               )}

//               {/* Form */}
//               <form onSubmit={handleSubmit}>
//                 {isRegister && (
//                   <TextField
//                     fullWidth
//                     label="Full Name"
//                     margin="normal"
//                     value={formData.name}
//                     onChange={(e) => handleInputChange('name', e.target.value)}
//                     required
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <Person color="action" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 )}

//                 <TextField
//                   fullWidth
//                   label="Email Address"
//                   type="email"
//                   margin="normal"
//                   value={formData.email}
//                   onChange={(e) => handleInputChange('email', e.target.value)}
//                   required
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <Email color="action" />
//                       </InputAdornment>
//                     ),
//                   }}
//                 />

//                 <TextField
//                   fullWidth
//                   label="Password"
//                   type={showPassword ? 'text' : 'password'}
//                   margin="normal"
//                   value={formData.password}
//                   onChange={(e) => handleInputChange('password', e.target.value)}
//                   required
//                   helperText={isRegister ? "Minimum 6 characters" : ""}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <Lock color="action" />
//                       </InputAdornment>
//                     ),
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <IconButton onClick={togglePasswordVisibility} edge="end">
//                           {showPassword ? <VisibilityOff /> : <Visibility />}
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                   }}
//                 />

//                 {/* Registration Preferences */}
//                 {isRegister && (
//                   <Box sx={{ mt: 2 }}>
//                     <Typography variant="subtitle2" gutterBottom color="text.secondary">
//                       Preferences (Optional)
//                     </Typography>
                    
//                     <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
//                       <FormControl fullWidth size="small">
//                         <InputLabel>Diet Type</InputLabel>
//                         <Select
//                           value={formData.preferences.dietType}
//                           onChange={(e) => handleInputChange('preferences.dietType', e.target.value)}
//                           label="Diet Type"
//                         >
//                           <MenuItem value="Veg">🥕 Vegetarian</MenuItem>
//                           <MenuItem value="Non-Veg">🍖 Non-Vegetarian</MenuItem>
//                           <MenuItem value="Vegan">🌱 Vegan</MenuItem>
//                         </Select>
//                       </FormControl>

//                       <FormControl size="small" sx={{ minWidth: 120 }}>
//                         <InputLabel>Serving Size</InputLabel>
//                         <Select
//                           value={formData.preferences.servingSize}
//                           onChange={(e) => handleInputChange('preferences.servingSize', e.target.value)}
//                           label="Serving Size"
//                         >
//                           <MenuItem value={1}>1 person</MenuItem>
//                           <MenuItem value={2}>2 people</MenuItem>
//                           <MenuItem value={4}>4 people</MenuItem>
//                           <MenuItem value={6}>6 people</MenuItem>
//                           <MenuItem value={8}>8 people</MenuItem>
//                         </Select>
//                       </FormControl>
//                     </Box>

//                     <FormControl fullWidth size="small" sx={{ mb: 1 }}>
//                       <InputLabel>Cooking Time Preference</InputLabel>
//                       <Select
//                         value={formData.preferences.cookingTime}
//                         onChange={(e) => handleInputChange('preferences.cookingTime', e.target.value)}
//                         label="Cooking Time Preference"
//                       >
//                         <MenuItem value="quick">⚡ Quick (Under 30 min)</MenuItem>
//                         <MenuItem value="medium">🕐 Medium (30-60 min)</MenuItem>
//                         <MenuItem value="long">🕑 Long (Over 60 min)</MenuItem>
//                         <MenuItem value="any">🍳 Any Duration</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 )}

//                 {/* Remember Me */}
//                 {!isRegister && (
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={rememberMe}
//                         onChange={(e) => setRememberMe(e.target.checked)}
//                         color="primary"
//                       />
//                     }
//                     label="Remember me"
//                     sx={{ mt: 1 }}
//                   />
//                 )}

//                 {/* Submit Button */}
//                 <Button
//                   type="submit"
//                   fullWidth
//                   variant="contained"
//                   size="large"
//                   disabled={loading}
//                   sx={{ 
//                     mt: 3, 
//                     mb: 2, 
//                     py: 1.5,
//                     borderRadius: 2,
//                     background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
//                     '&:hover': {
//                       background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
//                     }
//                   }}
//                 >
//                   {loading ? (
//                     <CircularProgress size={24} color="inherit" />
//                   ) : (
//                     isRegister ? 'Create Account' : 'Sign In'
//                   )}
//                 </Button>

//                 <Divider sx={{ my: 2 }}>
//                   <Typography variant="body2" color="text.secondary"> OR
//                   </Typography>
//                 </Divider>

//                 {/* Switch Mode */}
//                 <Box sx={{ textAlign: 'center' }}>
//                   <Typography variant="body2" color="text.secondary">
//                     {isRegister ? 'Already have an account?' : "Don't have an account?"}
//                   </Typography>
//                   <Link
//                     component="button"
//                     type="button"
//                     variant="body2"
//                     onClick={switchMode}
//                     sx={{ 
//                       textDecoration: 'none',
//                       fontWeight: 'bold',
//                       '&:hover': { textDecoration: 'underline' }
//                     }}
//                   >
//                     {isRegister ? 'Sign In' : 'Sign Up'}
//                   </Link>
//                 </Box>

//                 {/* Demo Account */}
//                 <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
//                   <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
//                     Demo Account:
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     Email: demo@walai.com | Password: demo123
//                   </Typography>
//                 </Box>
//               </form>
//             </Paper>
//           </Box>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default Login;



import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import axios from 'axios';
const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    preferences: {
      dietType: 'Veg',
      servingSize: 2,
      allergies: [],
      cuisinePreferences: [],
      budgetRange: {
        min: 0,
        max: 1000,
      },
      cookingTime: 'any',
    },
  });
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  // Demo credentials check
  const demoCredentials = {
    email: 'demo@walai.com',
    password: 'demo123'
  };

  try {
    // For demo purposes, bypass API call and simulate login for demo account
    if (formData.email === demoCredentials.email && formData.password === demoCredentials.password) {
      setSuccess('Welcome back!');
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify({ ...formData, isDemoUser: true }));
      
      setTimeout(() => {
        onLogin({ user: formData, token: "demo-token" });
      }, 1000);
      return;
    }

    // Check if backend API URL is configured
    if (!process.env.REACT_APP_API_URL) {
      setError('Backend API URL not configured. Please use demo account for testing.');
      setLoading(false);
      return;
    }

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? formData : {
      email: formData.email,
      password: formData.password
    };

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}${endpoint}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setSuccess(isRegister ? 'Account created successfully!' : 'Welcome back!');
      
      setTimeout(() => {
        onLogin(response.data.user, response.data.token);
      }, 1000);
    } else {
      throw new Error('No token received');
    }

  } catch (error) {
    console.error('Authentication error:', error);
    setError(error.response?.data?.message || 'Authentication failed. Please use demo account for testing.');
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const switchMode = () => {
    console.log('Switching mode, current isRegister:', isRegister);
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      name: '',
      preferences: {
        dietType: 'Veg',
        servingSize: 2,
        allergies: [],
        cuisinePreferences: [],
        budgetRange: {
          min: 0,
          max: 1000,
        },
        cookingTime: 'any',
      },
    });
  };

  const handleDemoLogin = () => {
    console.log('Setting demo credentials');
    setFormData({
      ...formData,
      email: 'demo@walai.com',
      password: 'demo123',
    });
  };

  const WAILogo = ({ size = 120 }) => (
    <div className="relative flex items-center justify-center">
      <div
        className="relative rounded-xl p-4 shadow-2xl transform hover:scale-105 transition-all duration-300"
        style={{
          background: 'rgba(0, 113, 206, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 113, 206, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-yellow-400/20 rounded-xl"></div>
        <div
          className="relative z-10 font-bold"
          style={{ fontSize: size * 0.25 + 'px', letterSpacing: '-0.05em' }}
        >
          <span className="text-blue-600">W</span>
          <span className="text-yellow-500">A</span>
          <span className="text-yellow-500">I</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0071ce 0%, #004c91 25%, #ffc220 50%, #0071ce 75%, #004c91 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-20"
          style={{
            background: 'rgba(255, 194, 32, 0.3)',
            backdropFilter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-40 right-32 w-24 h-24 rounded-full opacity-20"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(30px)',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full opacity-10"
          style={{
            background: 'rgba(0, 113, 206, 0.3)',
            backdropFilter: 'blur(50px)',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-md mx-auto">
          <div
            className="rounded-3xl shadow-2xl border overflow-hidden transition-all duration-300 hover:shadow-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Header */}
            <div
              className="text-center py-8 px-6 border-b"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <WAILogo size={100} />
              <h1 className="text-3xl font-bold text-white mt-4 drop-shadow-lg">
                Sign in or create your account
              </h1>
              <p className="text-white/80 mt-2 text-sm drop-shadow">
                {isRegister
                  ? 'Create your account to get started with WAI'
                  : "Not sure if you have an account? Enter your phone number or email and we'll check for you."}
              </p>
            </div>

            <div className="p-6">
              {/* Error Message */}
              {error && (
                <div
                  className="mb-4 p-3 rounded-lg border backdrop-blur-sm"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <div className="flex items-center">
                    <div className="text-red-200 text-sm">{error}</div>
                    <button
                      onClick={() => setError('')}
                      className="ml-auto text-red-200 hover:text-red-100 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div
                  className="mb-4 p-3 rounded-lg border backdrop-blur-sm"
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <div className="text-green-200 text-sm">{success}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name Field for Registration */}
                {isRegister && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg border text-white placeholder-white/60 transition-all duration-300 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Phone number or email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border text-white placeholder-white/60 text-lg transition-all duration-300 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      }}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                {(isRegister || formData.email) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="w-full pl-10 pr-12 py-3 rounded-lg border text-white placeholder-white/60 transition-all duration-300 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {isRegister && <p className="text-xs text-white/60 mt-1">Minimum 6 characters</p>}
                  </div>
                )}

                {/* Preferences Section for Registration */}
                {isRegister && (
                  <div
                    className="mb-4 p-4 rounded-lg border backdrop-blur-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <h3 className="text-sm font-semibold text-white/90 mb-3">Preferences (Optional)</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-white/80 mb-1">
                          Diet Type
                        </label>
                        <select
                          value={formData.preferences.dietType}
                          onChange={(e) => handleInputChange('preferences.dietType', e.target.value)}
                          className="w-full px-3 py-2 rounded-md border text-white text-sm transition-all duration-300 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <option
                            value="Veg"
                            style={{ background: 'rgba(0, 113, 206, 0.9)', color: 'white' }}
                          >
                            🥕 Vegetarian
                          </option>
                          <option
                            value="Non-Veg"
                            style={{ background: 'rgba(0, 113, 206, 0.9)', color: 'white' }}
                          >
                            🍖 Non-Vegetarian
                          </option>
                          <option
                            value="Vegan"
                            style={{ background: 'rgba(0, 113, 206, 0.9)', color: 'white' }}
                          >
                            🌱 Vegan
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/80 mb-1">
                          Serving Size
                        </label>
                        <select
                          value={formData.preferences.servingSize}
                          onChange={(e) =>
                            handleInputChange('preferences.servingSize', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-md border text-white text-sm transition-all duration-300 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            border: '1px balanced rgba(255, 255, 255, 0.2)',
                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <option
                            value={1}
                            style={{ background: 'rgba(0, 113, 206, 0.9)', color: 'white' }}
                          >
                            1 person
                          </option>
                          <option
                            value={2}
                            style={{ background: 'rgba(0, 113, 206, 0.9)', color: 'white' }}
                          >
                            2 people
                          </option>
                          <option
                            value={4}
                            style={{ background: 'rgba(0, 113, 206, 0.9)', color: 'white' }}
                          >
                            4 people
                          </option>
                          <option
                            value={6}
                            style={{ background: 'rgba(0, 113, 206, 0.9)', color: 'white' }}
                          >
                            6 people
                          </option>
                          <option
                            value={8}
                            style={{ background: 'rgba(0, 113, 206, 0.9)', color: 'white' }}
                          >
                            8 people
                          </option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">
                        Cooking Time Preference
                      </label>
                      <select
                        value={formData.preferences.cookingTime}
                        onChange={(e) => handleInputChange('preferences.cookingTime', e.target.value)}
                        className="w-full px-3 py-2 rounded-md border text-white text-sm transition-all duration-300 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <option
                          value="quick"
                          style={{ background: 'rgba(0, 113, 206, 0.9)', color: 'white' }}
                        >
                          ⚡ Quick (Under 30 min)
                        </option>
                        <option
                          value="medium"
                          style={{ background: 'rgba(0, 113, 206, 0.9)', color: 'white' }}
                        >
                          🕐 Medium (30-60 min)
                        </option>
                        <option
                          value="long"
                          style={{ background: 'rgba(0, 113, 206, 0.9)', color: 'white' }}
                        >
                          🕑 Long (Over 60 min)
                        </option>
                        <option
                          value="any"
                          style={{ background: 'rgba(0, 113, 206, 0.9)', color: 'white' }}
                        >
                          🍳 Any Duration
                        </option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Privacy Notice */}
                <div
                  className="mb-6 p-3 rounded-lg border backdrop-blur-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <p className="text-xs text-white/80">
                    Securing your personal information is our priority.
                  </p>
                  <a
                    href="#"
                    className="text-xs text-yellow-300 hover:text-yellow-100 underline transition-colors"
                  >
                    See our privacy measures.
                  </a>
                </div>

                {/* Continue Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 font-semibold rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  style={
                    loading
                      ? {
                          background: 'rgba(156, 163, 175, 0.3)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(156, 163, 175, 0.5)',
                          color: 'rgba(255, 255, 255, 0.5)',
                        }
                      : {
                          background: 'rgba(255, 194, 32, 0.2)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 194, 32, 0.5)',
                          boxShadow: '0 4px 12px rgba(255, 194, 32, 0.3)',
                        }
                  }
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/50"></div>
                    </div>
                  ) : (
                    'Continue'
                  )}
                </button>
              </form>

              {/* Switch Mode */}
              <div className="text-center mt-6">
                <p className="text-sm text-white/80 mb-2">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}
                </p>
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-yellow-300 hover:text-yellow-100 font-semibold text-sm hover:underline transition-colors"
                >
                  {isRegister ? 'Sign In' : 'Create Account'}
                </button>
              </div>

              {/* Demo Account */}
              <div
                className="mt-6 p-4 rounded-lg border text-center backdrop-blur-sm"
                style={{
                  background: 'rgba(255, 194, 32, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 194, 32, 0.3)',
                }}
              >
                <p className="text-xs text-white/80 mb-2">Demo Account for Testing:</p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="mb-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  style={{
                    background: 'rgba(255, 194, 32, 0.2)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 194, 32, 0.5)',
                  }}
                >
                  Use Demo Account
                </button>
                <p className="text-xs text-white/70">
                  Email: demo@walai.com | Password: demo123
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              className="py-4 px-6 text-center border-t backdrop-blur-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p className="text-xs text-white/70 mb-2">© 2025 WAI. All Rights Reserved.</p>
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-xs text-yellow-300 hover:text-yellow-100 transition-colors">
                  Give feedback
                </a>
                <a href="#" className="text-xs text-yellow-300 hover:text-yellow-100 transition-colors">
                  Privacy Rights
                </a>
                <a href="#" className="text-xs text-yellow-300 hover:text-yellow-100 transition-colors">
                  Your Privacy Choices
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;