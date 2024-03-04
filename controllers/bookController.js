// Import modules and files
const Book = require('../models/bookModel');
const mongoose = require('mongoose');
const generate = require('../utility/generateToken');

// Function to create a new book
const createBook = async (req, res) => {
    try {
        // Destructure request body
        const { title, author, genre, stocks } = req.body;

        // Retrieve user
        const user = req.user;

        // Check if the user is an admin
        if (user.isAdmin == true) {
            // Check if the book already exists
            const bookExists = await Book.findOne({ title: title, author: author });

            if (bookExists) {
                return res.status(409).json({ message: 'This book already exists' });
            }

            // Create a new book
            const newBook = await Book.create({
                title: title,
                author: author,
                genre: genre,
                stocks: stocks
            });

            if (newBook) {
                // Return the data if the response is successful
                return res.status(201).json({
                    _id: newBook.id,
                    title: newBook.title,
                    author: newBook.author,
                    genre: newBook.genre,
                    stocks: newBook.stocks
                })
            }
            else {
                return res.status(400).json({ message: 'Invalid request' });
            }

        }
        else {
            return res.status(401).json({ error: 'Unauthorized' });
        }

    }
    catch (error) {
        // Handle errors
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
};

// Function to get all books
const getAllBooks = async (req, res) => {
    try {
        // Retrieve all books from the database
        const allBooks = await Book.find({}).select('-createdAt -updatedAt -__v').sort({ createdAt: -1 });

        if(!allBooks || allBooks.length == 0) {
            return res.status(200).json({ message: 'There are no books recorded yet.' });
        }
        
        // Return successful response with all books
        return res.status(200).json(allBooks);
        
    }
    catch (error) {
        // Handle errors
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
}

// Function to get all books of a specific author
const getAllBooksOfSpecficAuthor = async (req, res) => {
    try {
        // Destructure author from request body
        const { author } = req.body;

        // Find all books by the specified author
        const hisBooks = await Book.find({ author: author }).select('-createdAt -updatedAt -__v');

        if (hisBooks.length === 0) {
            return res.status(200).json({ message: `There are no recorded books for the author ${author}` });
        }

        // Return successful response with books of the author
        return res.status(200).json(hisBooks);
    }
    catch (error) {
        // Handle errors
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
}

// Function to get a single book by its ID
const getBook = async (req, res) => {
    try {
        // Retrieve book ID from request parameters
        const { book_id } = req.params;

        // Check if the book ID is valid
        if (!mongoose.Types.ObjectId.isValid(book_id)) {
            return res.status(400).json({ error: 'Invalid book ID' });
        }

        // Find the book by its ID
        const book = await Book.findOne({_id: book_id}).select('-createdAt -updatedAt -__v');

        if (!book) {
            return res.status(400).json({ message: 'We could not find this book on our database' });
        }

        // Return successful response with the book
        return res.status(200).json(book);
    }
    catch (error) {
        // Handle errors
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
}

// Function to delete a book
const deleteBook = async (req, res) => {
    try{
        // Retrieve user from request object
        const user = req.user;

        // Check if the user is an admin
        if (user.isAdmin == true) {
            // Retrieve book ID from request parameters
            const { book_id } = req.params;

            // Check if the book ID is valid
            if (!mongoose.Types.ObjectId.isValid(book_id)) {
                return res.status(400).json({ error: 'We couldn\'t locate this book on our database' });
            }

            // Find the book by its ID
            const bookToDelete = await Book.findById(book_id);

            // Check if the book exists
            if (!bookToDelete) {
                return res.status(400).json({ error: 'We could not find this book on our database' });
            }

            // Retrieve the name of the book
            const bookName = bookToDelete.title;

            // Delete the book
            await Book.findOneAndDelete({ _id: book_id });

            // Return successful response after deleting the book
            return res.status(200).json({ message: `${bookName} book information is deleted on the database` });
        }
        else {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }
    catch (error) {
        // Handle errors
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
}    

// Function to update a book
const updateBook = async (req, res) => {
    try {
        // Retrieve user from request object
        const user = req.user;

        // Check if the user is an admin
        if (user.isAdmin == true) {
            // Retrieve book ID from request parameters
            const { book_id } = req.params;

            // Check if the book ID is valid
            if (!mongoose.Types.ObjectId.isValid(book_id)) {
                return res.status(400).json({ error: 'We couldn\'t locate this book on our database' });
            }

            // Update the book
            const updatedBook = await Book.findOneAndUpdate(
                { _id: book_id }, 
                {...req.body},  
                { new: true }
            ).select('-createdAt -updatedAt -__v');

            if (!updatedBook) {
                return res.status(400).json({ error: 'We could not find this book on our database' })
            }

            // Return successful response with the updated book
            return res.status(200).json(updatedBook);
        }
        else {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }
    catch (error) {
        // Handle errors
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
}

// Export functions to be used by routes
module.exports = { 
    createBook,
    getAllBooks,
    getBook,
    getAllBooksOfSpecficAuthor,
    updateBook,
    deleteBook
};

