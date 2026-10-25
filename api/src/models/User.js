const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nom és obligatori'],
      trim: true,
      minlength: [2, 'El nom ha de tenir mínim 2 caràcters'],
      maxlength: [100, 'El nom pot tenir com a màxim 100 caràcters']
    },
    email: {
      type: String,
      required: [true, "L'email és obligatori"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Format incorrecte']
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: { values: ['client', 'admin'], message: 'Rol no vàlid' },
      default: 'client'
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
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('User', userSchema);
