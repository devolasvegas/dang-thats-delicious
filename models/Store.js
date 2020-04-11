const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: 'Please enter a store name!',
	},
	slug: String,
	description: {
		type: String,
		trim: true,
	},
	tags: [String],
	created: {
		type: Date,
		default: Date.now,
	},
	location: {
		type: {
			type: String,
			default: 'Point',
		},
		coordinates: [
			{
				type: Number,
				required: 'You must supply coordinates!',
			},
		],
		address: {
			type: String,
			required: 'You must supply an address!',
		},
	},
	photo: String,
});

storeSchema.pre('save', function (next) {
	// create new slug only if adding new name or modifying name/
	if (!this.isModified('name')) {
		return next();
	}

	this.slug = slug(this.name);
	next();

	// TODO: add code to eliminate redundant slugs
});

module.exports = mongoose.model('Store', storeSchema);
