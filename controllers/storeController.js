const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
	storage: multer.memoryStorage(),
	fileFilter(req, file, next) {
		const isPhoto = file.mimetype.startsWith('image/');

		if (isPhoto) {
			next(null, true);
		} else {
			next({ message: "That filetype isn't allowed!" }, false);
		}
	},
};

exports.homePage = (req, res) => {
	res.render('index');
};

exports.addStore = (req, res) => {
	res.render('editStore', { title: 'Add Store' });
};

// Upload images
exports.upload = multer(multerOptions).single('photo');

// Process images
exports.resize = async (req, res, next) => {
	// check if there is new files to resize
	if (!req.file) {
		next(); //skip to the next middleware
		return;
	}

	const extension = req.file.mimetype.split('/')[1];
	const photo = await jimp.read(req.file.buffer);

	req.body.photo = `${uuid.v4()}.${extension}`;

	//now we resize
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);

	// once written to filesystem, keep going!
	next();
};

exports.createStore = async (req, res) => {
	const store = await new Store(req.body).save();
	req.flash(
		'success',
		`Successfully Created ${store.name}. Care to leave a review?`
	);
	res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
	// 1. Query the db for list of all stores
	const stores = await Store.find();
	res.render('stores', { title: 'Stores', stores });
};

exports.editStore = async (req, res) => {
	// 1. find the store given the ID
	const store = await Store.findOne({ _id: req.params.id });
	// 2. Confirm user is owner of store
	// TODO
	// 3. Render edit form for updates
	res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
	// Set location data to be a point
	req.body.location.type = 'Point';

	// 1. Find and update store.
	const store = await (
		await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
			new: true,
			runValidators: true,
		})
	).execPopulate();
	req.flash(
		'success',
		`Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store -></a>`
	);
	res.redirect(`/stores/${store.id}/edit`);
	// 2. Redirect to store and flash
};

exports.getStoreBySlug = async (req, res, next) => {
	const { slug } = req.params;
	const store = await Store.findOne({ slug });

	if (!store) {
		return next();
	}

	res.render('store', { store, title: store.name });
};
