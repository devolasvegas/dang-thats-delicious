const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Failed Login. 😑',
	successRedirect: '/',
	successFlash: 'You are now logged in! 😀',
});

exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You are now logged out.');
	res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
	// check if the user is authenticated
	if (req.isAuthenticated()) {
		return next();
	}

	req.flash('error', 'Oops! you must be logged in to do that! ☝');
	res.redirect('/login');
};

exports.forgot = async (req, res) => {
	// 1. See if user exists
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		req.flash('success', 'A password reset has been mailed to you.');
		return res.redirect('/login');
	}

	// 2. Set reset token and expirty on their account
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 3600000; // One hour from 'now'

	await user.save();

	// 3. Send email with token
	const resetURL = `https://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
	req.flash(
		'success',
		`You have been emailed a password reset link ${resetURL}`
	);

	// 4. Redirect to login page
	res.redirect('/login');
};
