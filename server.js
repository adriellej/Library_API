// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// Create an Express application
const app = express();

// Import route handlers
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowBook = require('./routes/borrowRoutes');

// Define the port for the server to listen on, defaulting to 4000 if not provided
const PORT = process.env.PORT || 4000;

// Function to connect to MongoDB database
const connectDB = async () => {
    try {
        // Connect to MongoDB using the provided URI
		const conn = await mongoose.connect(process.env.MONGO_URI);
		// Log a successful connection
		console.log(`MongoDB Connected: ${conn.connection.host}`);

		// Start the server listening on the specified port
		app.listen(PORT, () => {
			console.log(`Server is running on port: ${PORT}`);
		});
	}
	catch (error){
		// Log any errors that occur during database connection
		console.error(`Error: ${error.message}`);
		// Exit the process with a non-zero status code to indicate failure
		process.exit(1);
	}
};

// Middleware to parse JSON bodies of incoming requests
app.use(express.json());
// Middleware to parse cookies from incoming requests
app.use(cookieParser());

// Mount route handlers at specified paths
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/requestBooks', borrowBook);

// Call the connectDB function
connectDB();

