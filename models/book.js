const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url: String,
    filename: String
});

imageSchema.virtual('thumbnail').get(function () {
    return this.url.includes('/upload')
        ? this.url.replace('/upload', '/upload/w_200')
        : this.url;
});

const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

const BookSchema = new Schema({
    title: { type: String, required: true }, // book title
    authorName: { type: String, required: true }, // book's original author
    isbn: {
        type: String,
        required: true,
        match: [/^\d{10}(\d{3})?$/, 'ISBN must be 10 or 13 digits']
    },
    yearOfPublication: {
        type: Number,
        min: 1000,
        max: new Date().getFullYear(),
        required: true
    },
    images: [imageSchema],
    price: { type: Number, required: true, min: 0 },
    condition: {
        type: String,
        enum: ['Like New', 'Good', 'Acceptable', 'Poor'],
        required: true
    },
    description: { type: String, required: true },
    location: String,
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerContact: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Virtual for popup or preview use (e.g., in maps or cards)
BookSchema.virtual('properties.popUpMarkup').get(function () {
    const safeTitle = this.title ? this.title.replace(/["']/g, match => match === '"' ? '&quot;' : '&#39;') : 'No Title';
    const safeDescription = this.description
        ? this.description.substring(0, 20).replace(/["']/g, match => match === '"' ? '&quot;' : '&#39;')
        : 'No Description';

    return `<strong><a href="/books/${this._id}">${safeTitle}</a></strong><p>${safeDescription}...</p>`;
});

module.exports = mongoose.model('Book', BookSchema);
