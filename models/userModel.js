// Import mongoose library for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for the user model
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Export the user model created using the defined schema
module.exports = new mongoose.model('User', userSchema);

