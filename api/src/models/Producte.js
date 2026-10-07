const mongoose = require('mongoose');

const producteSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true, maxlength: 100 },
  descripcio: { type: String, trim: true, maxlength: 1000 },

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
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: "L'stock ha de ser un enter"
    }
  },

  tipus: {
    type: String,
    required: true,
    enum: ['casc', 'joc', 'accessori']
  },

  imatgeURL: {
    type: String,
    match: [/^https?:\/\/.+/, "La URL ha de començar per http:// o https://"]
  },
  categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' }
});

producteSchema.index({ nom: 1 });
producteSchema.index({ tipus: 1, preu: 1 });

module.exports = mongoose.model('Producte', producteSchema);