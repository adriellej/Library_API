// Import the mongoose library
const mongoose = require('mongoose');

// Define a schema for the Book model
const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        genre: {
            type: String,
            required: true
        },
        stocks: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Export a model based on the schema
module.exports = new mongoose.model('Book', bookSchema);

