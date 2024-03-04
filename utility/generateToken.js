// Import the jsonwebtoken library for handling JWT (JSON Web Tokens)
const jwt = require('jsonwebtoken');

// Function to generate a JWT token and set it as a cookie in the response
const generate = (res, user_id) => {
    // Generate a JWT token with the user_id, using the JWT_SECRET from environment variables
    const token = jwt.sign({ user_id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Set the expiration time for the token to 30 days
    });

    // Set the JWT token as a cookie in the response
    res.cookie('jwt', token, {
        httpOnly: true, // Make the cookie accessible only through HTTP requests
        secure: process.env.NODE_ENV !== 'development', // Set cookie secure attribute based on environment
        sameSite: 'strict', // Restrict cookie to be sent only in same-site requests
        maxAge: 30 * 24 * 60 * 1000 // Set the maximum age of the cookie to 30 days
    });
}

// Export the generate function
module.exports = generate;
