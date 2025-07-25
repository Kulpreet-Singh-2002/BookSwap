const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateBook } = require('../middleware');
const books = require('../controllers/books');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// 📚 View all books with pagination / Post new book
router.route('/')
    .get(catchAsync(books.index)) // Pagination supported
    .post(isLoggedIn, upload.array('image'), validateBook, catchAsync(books.createBook));

// 📝 Form to list a new book
router.get('/new', isLoggedIn, books.renderNewForm);

// 📂 My uploads (Books uploaded by logged-in user)
router.get('/myuploads', isLoggedIn, catchAsync(books.myUploads));

// 📖 View, ✏️ Update, and ❌ Delete a specific book
router.route('/:id')
    .get(catchAsync(books.showBook))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateBook, catchAsync(books.updateBook))
    .delete(isLoggedIn, isAuthor, catchAsync(books.deleteBook));

// ✏️ Form to edit a book
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(books.renderEditForm));

module.exports = router;
