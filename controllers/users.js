const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    try {
        const { username, email,contactNumber, password } = req.body;
        const user = new User({ email, username,contactNumber });
        const registerUser = await User.register(user, password);

        req.login(registerUser, function (err) {
            if (err) { return next(err); }
            req.flash('success', 'Welcome to BookSwap');
            res.redirect('/books'); // ⬅️ changed
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.userLogin = (req, res) => {
    req.flash('success', 'Welcome Back');
    const redirectUrl = res.locals.returnTo || '/books'; // ⬅️ changed
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.userLogout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/books'); // ⬅️ changed
    });
};
