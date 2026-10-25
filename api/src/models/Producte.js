const mongoose = require('mongoose');

const producteSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'El nom és obligatori'],
    trim: true,
    maxlength: [100, 'El nom pot tenir com a màxim 100 caràcters']
  },
  descripcio: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripció pot tenir com a màxim 1000 caràcters']
  },
  preu: {
    type: Number,
    required: [true, 'El preu és obligatori'],
    min: [0, 'El preu no pot ser negatiu'],
    validate: {
      validator: (v) => /^\d+(\.\d{1,2})?$/.test(v.toString()),
      message: 'El preu només pot tenir fins a 2 decimals'
    }
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, "L'stock no pot ser negatiu"],
    validate: {
      validator: Number.isInteger,
      message: "L'stock ha de ser un enter"
    }
  },
  tipus: {
    type: String,
    required: [true, 'El tipus és obligatori'],
    enum: {
      values: ['casc', 'joc', 'accessori'],
      message: 'Tipus no vàlid (casc, joc o accessori)'
    }
  },
  imatgeURL: {
    type: String,
    match: [/^https?:\/\/.+/, 'La URL ha de començar per http:// o https://']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }
});

producteSchema.index({ nom: 1 });
producteSchema.index({ tipus: 1, preu: 1 });

module.exports = mongoose.model('Producte', producteSchema);
