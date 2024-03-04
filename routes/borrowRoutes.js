// Import the express module and create a router instance
const router = require('express').Router();

// Import middleware for authentication
const verify = require('../middlewares/authMiddleware');

// Import the controller functions for handling borrow operations
const { borrowBook, getAllBorrowedBooks, getAllBorrowedBooksbyReader, returnBook} = require('../controllers/borrowController');

router.post('/borrowBook', verify, borrowBook); // Route for borrowing a book
router.get('/allBooks', verify, getAllBorrowedBooks); // Route for retrieving all borrowed books
router.get('/allBooksByReader', verify, getAllBorrowedBooksbyReader); // Route for retrieving all borrowed books by a specific reader
router.put('/book/', verify, returnBook); // Route for returning a borrowed book

// Export the router module
module.exports = router;


