const Book = require('../models/book');
const User = require('../models/user');
const { cloudinary } = require('../cloudinary');

// 🌐 Home Page - List of books with pagination and search
module.exports.index = async (req, res) => {
    const perPage = 10;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.q || '';

    try {
        let query = {};
        if (searchQuery) {
            const regex = new RegExp(searchQuery, 'i'); // case-insensitive
            query = {
                $or: [
                    { title: regex },
                    { authorName: regex },
                    { description: regex }
                ]
            };
        }

        const totalBooks = await Book.countDocuments(query);
        const books = await Book.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.render('books/index', {
            books,
            currentPage: page,
            totalPages: Math.ceil(totalBooks / perPage),
            searchQuery
        });
    } catch (err) {
        console.error("Search/Pagination error:", err);
        req.flash('error', 'Unable to load books at the moment.');
        res.redirect('/');
    }
};

// 👤 My Uploads - Show books uploaded by current user
module.exports.myUploads = async (req, res) => {
    const perPage = 10;
    const page = parseInt(req.query.page) || 1;

    try {
        const totalBooks = await Book.countDocuments({ seller: req.user._id });
        const books = await Book.find({ seller: req.user._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.render('books/myuploads', {
            books,
            currentPage: page,
            totalPages: Math.ceil(totalBooks / perPage),
            searchQuery: '' // empty for my uploads, no search needed
        });
    } catch (err) {
        console.error("MyUploads error:", err);
        req.flash('error', 'Unable to load your uploaded books.');
        res.redirect('/books');
    }
};


// 🆕 Form for new book
module.exports.renderNewForm = (req, res) => {
    res.render('books/new');
};

// ➕ Create a new book
module.exports.createBook = async (req, res) => {
    const book = new Book(req.body.book);
    book.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    book.seller = req.user._id;

    const currentUser = await User.findById(req.user._id);
    book.sellerContact = currentUser.contactNumber;

    await book.save();
    req.flash('success', 'Successfully posted a new book!');
    res.redirect(`/books/${book._id}`);
};

// 🔍 Show book details
module.exports.showBook = async (req, res) => {
    const book = await Book.findById(req.params.id).populate('seller');
    if (!book) {
        req.flash('error', 'Cannot find that book');
        return res.redirect('/books');
    }
    res.render('books/show', { book });
};

// ✏️ Form to edit book
module.exports.renderEditForm = async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) {
        req.flash('error', 'Cannot find that book');
        return res.redirect('/books');
    }
    res.render('books/edit', { book });
};

// 🔄 Update book
module.exports.updateBook = async (req, res) => {
    const { id } = req.params;
    const book = await Book.findByIdAndUpdate(id, { ...req.body.book }, { new: true });

    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    book.images.push(...imgs);
    await book.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await book.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    req.flash('success', 'Successfully updated the book');
    res.redirect(`/books/${book._id}`);
};

// ❌ Delete book
module.exports.deleteBook = async (req, res) => {
    const { id } = req.params;

    const book = await Book.findById(id);
    const images = book.images.map(img => img.filename);

    for (const filename of images) {
        await cloudinary.uploader.destroy(filename);
    }

    await Book.findByIdAndDelete(id);

    req.flash('success', 'Successfully deleted the book');
    res.redirect('/books');
};
