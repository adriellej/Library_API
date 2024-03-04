// Import mongoose library
const mongoose = require('mongoose');

// Define schema for borrowed book
const borrowedBookSchema = new mongoose.Schema({
    // Reference to the user who borrowed the book
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // Reference to the book that is borrowed
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    // Number of copies borrowed
    bookCopies: {
        type: Number,
        required: true
    },
    // Date when the book was borrowed (default is current date)
    borrowDate: {
        type: Date,
        default: Date.now
    },
    // Number of copies returned
    returnedCopies: {
        type: Number
    },
    // Expected return date of the book
    returnDate: {
        type: Date
    },
    // Flag indicating whether the book has been returned
    returned: {
        type: Boolean,
        default: false
    }
});

// Create a model named BorrowedBook from the schema
const BorrowedBook = new mongoose.model('BorrowedBook', borrowedBookSchema);

// Export the BorrowedBook model
module.exports = BorrowedBook;
