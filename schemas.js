const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// Extend Joi to sanitize HTML
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if (clean !== value) {
                    return helpers.error('string.escapeHTML', { value });
                }
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

// ✅ Updated bookSchema
module.exports.bookSchema = Joi.object({
    book: Joi.object({
        title: Joi.string().required().escapeHTML(),
        authorName: Joi.string().required().escapeHTML(),
        isbn: Joi.string().pattern(/^\d{10}(\d{3})?$/).required().escapeHTML(),
        yearOfPublication: Joi.number()
            .min(1000)
            .max(new Date().getFullYear())
            .required(),
        condition: Joi.string()
            .valid('Like New', 'Good', 'Acceptable', 'Poor')
            .required()
            .escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});
