// Import the Express router module
const router = require('express').Router();

// Import middleware for authentication verification
const verify = require('../middlewares/authMiddleware');

// Import controller functions for book operations
const { 
    createBook, 
    getAllBooks, 
    getBook, 
    getAllBooksOfSpecficAuthor, 
    getBookOfSpecficAuthor, 
    updateBook, 
    deleteBook 
} = require('../controllers/bookController');

// Define routes for different book operations
// Route to create a new book
router.post('/createBook', verify, createBook);

// Route to get all books
router.get('/allBooks', getAllBooks);

// Route to get all books of a specific author
router.get('/author', getAllBooksOfSpecficAuthor);

// Route to get, update, or delete a specific book by ID
router.route('/book/:book_id').get(getBook).put(verify, updateBook).delete(verify, deleteBook);

// Export the router module
module.exports = router;

