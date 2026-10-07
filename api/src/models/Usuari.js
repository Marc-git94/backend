const mongoose = require('mongoose');

const usuariSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'El nom és obligatori'],
    trim: true,
    minlength: [2, 'El nom ha de tenir mínim 2 caràcters'],
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, "L'email és obligatori"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email no vàlid']
  },
  contrasenya: {
    type: String,
    required: true,
    minlength: [8, 'Mínim 8 caràcters']
  },
  rol: {
    type: String,
    enum: {
      values: ['client', 'admin'],
      message: 'Rol no vàlid'
    },
    default: 'client'
  },
  dataRegistre: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Usuari', usuariSchema);