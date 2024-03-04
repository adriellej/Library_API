// Import necessary modules and dependencies
const User = require('../models/userModel'); // Import the User model
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const mongoose = require('mongoose'); // Import mongoose for MongoDB interactions

const generate = require('../utility/generateToken'); // Import token generation utility

// Function to create a new user
const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body; // Extract user input from request body

        const user = req.user; // Access the user information from request

        // Check if the user is an admin
        if (user.isAdmin == true) {
            // Check if the user already exists
            const userExists = await User.findOne({ email: email });

            if (userExists) {
                return res.status(409).json({ message: 'This user already exists' });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create a new user
            const new_user = await User.create({
                name: name,
                email: email,
                password: hashedPassword
            });
    
            // Return the newly created user
            if (new_user) {
                return res.status(201).json({
                    _id: new_user._id,
                    name: new_user.name,
                    email: new_user.email,
                    password: new_user.password,
                    isAdmin: new_user.isAdmin
                })
            }
            else {
                return res.status(400).json({ message: 'Invalid User' });
            }
        }
        else {
            return res.status(401).json({ error: 'Unauthorized' }); // Return message for Unauthorized access if not admin
        }

    }
    catch (error) {
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
};

// Function to log in a user
const loginUser = async (req, res) => {
    try{
        const { email, password } = req.body; // Extract login credentials from request body

        // Find the user by email
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(409).json({ message: 'This user doesn\'t have an account yet.' });
        }

        // Compare passwords
        const matchedPassword = await bcrypt.compare(password, user.password);

        if (user && matchedPassword) {
            // Generate and send token upon successful login
            generate(res, user._id);
            return res.status(200).json({
                message: 'Logged in Successfully',
                _id: user._id,
                name: user.name,
                email: user.email
            })
        }
        else {
            return res.status(400).json({ message: 'Wrong email or password' });
        }

    }
    catch (error) {
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
}

// Function to logout a user
const logoutUser = async (req, res) => {
    try {
        // Clear JWT cookie upon logout
        res.cookie("jwt", "", {
            httpOnly: true,
            expires: new Date(0)
        });

        return res.status(200).json({ message: 'User logged out' });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message,
            stack: error.message
        })

        /*
            console.error(error);
            res.status(500).json({
                    error: error.message,
                    stack: error.stack
            })
        */
    }
}

// Function to get all user profiles (accessible only to admins)
const getAllUserProfiles = async (req, res) => {
    try {
        const user = req.user;

        // Check if the current user is admin
        if (user.isAdmin == true) {
            // Retrieve all user profiles, excluding sensitive fields, and sorted by creation date
            const userProfiles = await User.find({}).select('-createdAt -updatedAt -__v').sort({ createdAt: -1 });

            return res.status(200).json(userProfiles);
        }
        else {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })

        /*
            console.error(error);
            res.status(500).json({
                    error: error.message,
                    stack: error.stack
            })
        */
    } 
    
}

// Function to get a specific user profile (accessible only to admins)
const getUserProfile = async (req, res) => {
    try {
        const user = req.user;

        // Check if the current user is admin
        if (user.isAdmin == true) {

            // Destructure the id, sent from the parameters
            const { id } = req.params;

            // Validate the id
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'User not found' });
            }

            // Retrieve user data by id, excluding sensitive fields
            const profile = await User.findOne({ _id: id }).select('-createdAt -updatedAt -__v');

            // If data is not found, return an error message
            if (!profile) {
                return res.status(400).json({ error: 'User does not exist' })
            }

            // Display the data, if the request is successful
            return res.status(200).json(profile);
        }
        else {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
    
}

// Function to delete a user profile (accessible only to admins)
const deleteUser = async (req, res) => {
    try{
        const user = req.user;

        // Check if the current user is an admin
        if (user.isAdmin == true) {

            const { id } = req.params;

            // Check if the id is valid
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'User not found' });
            }

            // Find the user by id
            const userToDelete = await User.findById(id);

            // Check if the user exists
            if (!userToDelete) {
                return res.status(400).json({ error: 'User does not exist' });
            }

            // Retrieve the name of the user to be deleted
            const userName = userToDelete.name;

            // Delete the user
            await User.findOneAndDelete({ _id: id });

            return res.status(200).json({ message: `User ${userName}'s profile is deleted` });
        }
        else {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }

}

// Function to update a user profile (accessible only to admins)
const updateUser = async (req, res) => {
    try {
        const user = req.user;

        // Check if the current user is an admin
        if (user.isAdmin == true) {
            const { id } = req.params;

            // Check if the id is valid
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'User not found' });
            }

            // Update the user with the new data
            const updatedUser = await User.findOneAndUpdate(
                { _id: id }, 
                {...req.body},  
                { new: true } // Return the updated document
            ).select('-createdAt -updatedAt -__v');

            if (!updatedUser) {
                return res.status(400).json({ error: 'User does not exist' })
            }

            // Return the updated user profile
            return res.status(200).json(updatedUser);
        }
        else {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }

}

// Export all functions for use in routes
module.exports = { 
    createUser, 
    loginUser, 
    logoutUser, 
    getAllUserProfiles,
    getUserProfile, 
    deleteUser,
    updateUser
};

