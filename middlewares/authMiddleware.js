// Import required packages and modules
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Create the function to verify the token credibility
const verify = async (req, res, next) => {
	// Initialize the variable to hold the token value.
	let token;

	// Retrieve token from request cookies
	token = req.cookies.jwt;

	// Check if token exists
	if (!token) {
		return res.status(401).json({ error: 'Token does not exist' });
	}

	try{
		// Decode the token value
		const decoded_token = jwt.verify(token, process.env.JWT_SECRET);

	    // Fetch user details based on decoded token
	    req.user = await User.findById(decoded_token.user_id);

	    // Check if user exists
	    if (!req.user) {
	    	return res.status(401).json({ error: 'User not found' });
	    }

	    // Move to the next middleware
	    next();
	}
	catch (error) {
		// Handle invalid token error
		return res.status(401).json({ message: 'Invalid token' });
	}
}

// Export the verification middleware
module.exports = verify;

