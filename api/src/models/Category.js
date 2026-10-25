const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nom és obligatori'],
      trim: true,
      minlength: [3, 'El nom ha de tenir mínim 3 caràcters']
    },
    slug: {
      type: String,
      required: [true, "El slug és obligatori"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'El slug només pot tenir minúscules, números i guions'
      ]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripció pot tenir com a màxim 500 caràcters']
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Category', categorySchema);
