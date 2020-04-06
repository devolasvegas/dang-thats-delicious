const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Please enter a store name!",
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
});

storeSchema.pre("save", function (next) {
  // create new slug only if adding new name or modifying name/
  if (!this.isModified("name")) {
    return next();
  }

  this.slug = slug(this.name);
  next();

  // TODO: add code to eliminate redundant slugs
});

module.exports = mongoose.model("Store", storeSchema);
