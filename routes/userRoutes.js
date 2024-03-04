// Import necessary modules
const router = require('express').Router();

// Import middleware for user authentication
const verify = require('../middlewares/authMiddleware');

// Import functions from userController for handling user-related requests
const { 
    createUser, 
    loginUser, 
    logoutUser, 
    getAllUserProfiles, 
    getUserProfile, 
    deleteUser, 
    updateUser 
} = require('../controllers/userController');

// Routes for handling user creation, login, and logout
router.post('/create', verify, createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Route for getting all user profiles
router.get('/allprofiles', verify, getAllUserProfiles);

// Route for handling specific user profile requests including retrieving, updating, and deleting
router.route('/profile/:id').get(verify, getUserProfile).delete(verify, deleteUser).put(verify, updateUser);

// Export the router module
module.exports = router;

