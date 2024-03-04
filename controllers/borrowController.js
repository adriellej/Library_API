// Import models and utilities
const Book = require('../models/bookModel');
const BorrowedBook = require('../models/borrowModel');
const mongoose = require('mongoose');
const generate = require('../utility/generateToken');

// Function to handle borrowing a book
const borrowBook = async (req, res) => {
    try {
        // Extract book id and book copies from request body
        const { book_id, book_copies } = req.body;

        // Check if the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const user = req.user;

        if (user.isAdmin==false) {
            // Check if the book id is valid
            if (!mongoose.Types.ObjectId.isValid(book_id)) {
                return res.status(400).json({ error: 'Invalid book ID' });
            }

            // Find the book information by its id
            const bookInfo = await Book.findById(book_id);
            if (!bookInfo) {
                return res.status(404).json({ error: 'Book not found' });
            }

            // Check if the book is already borrowed by the user
            const isAlreadyBorrowed = await BorrowedBook.findOne({ book: book_id, user: user._id, returned: false });

            if (isAlreadyBorrowed) {
                return res.status(400).json({ error: 'You have already borrowed this book' });
            }

            // Check if there are available copies of the book
            if (bookInfo.stocks > 0) {
                // Decrement the book stock by the user-specified value
                await Book.findByIdAndUpdate(
                    { _id: book_id }, 
                    { $inc: { stocks: -book_copies } },  
                    { new: true }
                );

                // Create a record for the borrowed book
                const borrowedBook = await BorrowedBook.create({
                    user: user._id,
                    book: book_id,
                    bookCopies: book_copies
                });

                // Populate book details in the borrowed book record
                await borrowedBook.populate('book');

                const book = borrowedBook.book;

                // Return success response with borrowed book details
                return res.status(201).json({
                    _id: borrowedBook.id,
                    user: {
                        _id: user._id,
                        name: user.name
                    },
                    book: {
                        _id: book._id,
                        title: book.title,
                        author: book.author,
                        genre: book.genre,
                        borrowedCopies: book_copies,
                        remainingStocks: book.stocks,
                    },
                    borrowDate: borrowedBook.borrowDate
                }).select('-createdAt -updatedAt -__v');
            } else {
                // Return error response if there are no available copies
                return res.status(400).json({ error: 'There are no available copies of this book' });           
            }
        } else {
            return res.status(401).json({ error: 'Unauthorized user' })
        }

        
    } catch (error) {
        // Return error response if any error occurs
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        });
    }
};

// Function to get all borrowed books
const getAllBorrowedBooks = async (req, res) => {
    try{
        // Check if the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const user = req.user;

        // Check if the user is an admin
        if (user.isAdmin == true) {
            // Find all borrowed books
            const allBorrowedBooks = await BorrowedBook.find({}).select('-createdAt -updatedAt -__v').sort({ createdAt: -1 });

            if (!allBorrowedBooks) {
                return res.status(400).json({ message: 'No record found.' })
            }

            // Return success response with all borrowed books
            return res.status(200).json(allBorrowedBooks);

        } else {
            // Return error response if the user is not authorized
            return res.status(401).json({ error: 'Unauthorized user' });
        }
    }
    catch (error) {
        // Return error response if any error occurs
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
};

// Function to get all borrowed books by a specific reader
const getAllBorrowedBooksbyReader = async (req, res) => {
    try{
        // Check if the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { user_id } = req.body;

        const user = req.user;

        // Check if the book id is valid
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ error: 'Invalid reader ID' });
        }

        // Check if the user is an admin or the same user as the one being requested
        if ((user.isAdmin == true) || (user._id == user_id)) {
            // Find all borrowed books by the specific reader
            const allBorrowedBooks = await BorrowedBook.find({ user: user_id })
                .select('-createdAt -updatedAt -__v')
                .sort({ createdAt: -1 })
                .populate({
                    path: 'book',
                    select: 'title author genre', // Retrieve only specific fields of the book
                    options: { select: '-createdAt -updatedAt -__v' }
                })
                .populate({
                    path: 'user',
                    select: 'name', // Retrieve only the name of the user
                    options: { select: '-createdAt -updatedAt -__v' }
                });

            if (!allBorrowedBooks || allBorrowedBooks.length == 0) {
                return res.json({ message: 'No record found for this user.' })
            }

            // Return success response with borrowed books by the reader
            return res.status(200).json({allBorrowedBooks});
        } else {
            // Return error response if the user is not authorized
            return res.status(401).json({ error: 'Unauthorized user' });
        }
    }
    catch (error) {
        // Return error response if any error occurs
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
};

const returnBook = async (req, res) => {
    try {
        const { borrowedBookId, returned_copies } = req.body;
        const user = req.user;

        if (!mongoose.Types.ObjectId.isValid(borrowedBookId)) {
            return res.status(400).json({ error: 'Invalid book ID' });
        }

        const borrowedBook = await BorrowedBook.findById(borrowedBookId);

        if (!borrowedBook) {
            return res.status(404).json({ error: 'Borrowed book not found' });
        }

        // Check if the user is the same as the book borrower
        if (user._id.toString() !== borrowedBook.user.toString()) {
            return res.status(401).json({ error: 'Unauthorized user' });
        }

        // Return a message if the book is already returned
        if (borrowedBook.returned) {
            return res.status(400).json({ error: 'The book has already been returned' });
        }

        // Return a message if the user returned 0 book copy
        if ((returned_copies === 0)  || (returned_copies === "")) {
            return res.status(400).json({ error: 'You did not return any book copy.' });
        }

        // Check if books returned are more than the borrowed copies
        // Return an error message
        else if (returned_copies > borrowedBook.bookCopies) {
            return res.status(422).json({ error: 'You returned more copies than needed.' });
        }

        const book = await Book.findById(borrowedBook.book);

        const updatedBook = await Book.findByIdAndUpdate(
            book.id,
            { $inc: { stocks: returned_copies } },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(400).json({ error: 'Failed to update book stock.' });
        }

        const updatedBorrowedBook = await BorrowedBook.findByIdAndUpdate(
            borrowedBookId,
            { $inc: { bookCopies: -returned_copies, returnedCopies: returned_copies } },
            { new: true }
        );

        // Check if all copies have been returned and update the status accordingly
        if (updatedBorrowedBook.bookCopies === 0) {
            updatedBorrowedBook.returned = true;
        }

        // Update return date
        updatedBorrowedBook.returnDate = new Date();
        await updatedBorrowedBook.save();

        return res.status(200).json({ message: 'Book returned successfully' });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        });
    }
};


/*
// Function to handle returning a borrowed book
const returnBook = async (req, res) => {
    try{
        const { borrowedBookId, book_copies } = req.body;

        const user = req.user;

        // Check if the book id is valid
        if (!mongoose.Types.ObjectId.isValid(borrowedBookId)) {
            return res.status(400).json({ error: 'Invalid book ID' });
        }

        // Find the borrowed book by ID
        const borrowedBook = await BorrowedBook.findById(borrowedBookId);

        // Check if borrowed book exists
        if (!borrowedBook) {
            return res.status(404).json({ error: 'Borrowed book not found' });
        }

        //Check if the current user is the same as the book borrower
        if (user._id.toString() !== borrowedBook.user.toString()) {
            return res.status(401).json({ error: 'Unauthorized user' });
        }

        // Check if the book has already been returned
        if (borrowedBook.returned) {
            return res.status(400).json({ error: 'The book has already been returned' });
        }

        if (book_copies > borrowedBook.bookCopies) {

        }

        const book = await Book.findById(borrowedBook.book);

        // Increment the book stock
        const updatedBook = await Book.findByIdAndUpdate(
            book.id,
            { $inc: { stocks: + book_copies } },
            { new: true }
        );

        // Check if the book was updated successfully
        if (!updatedBook) {
            return res.status(400).json({ error: 'Failed to update book stock.' });
        }

        if (book_copies == borrowedBook.bookCopies) {
            // Update borrowed book to mark as returned
            borrowedBook.returned = true;
        }
        
        // Update the returnDate
        borrowedBook.returnDate = new Date();
        await borrowedBook.save();

        // Return success response
        return res.status(200).json({ message: 'Book returned successfully' });
        

    }
    catch (error) {
        // Return error response if any error occurs
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
};

*/

// Exporting the functions
module.exports = {
    borrowBook,
    getAllBorrowedBooks,
    getAllBorrowedBooksbyReader,
    returnBook
}

