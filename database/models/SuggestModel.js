const mongoose = require('mongoose');

const sugerenciaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  guildId: { type: String, required: true },
  canalId: { type: String },
  mensajeId: { type: String },
  estado: { type: String, enum: ['Voting', 'Accepted', 'Rejected'], default: 'Voting' },
  contenido: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  autor: { type: String, required: true }, 
  comentarios: [{ autor: String, contenido: String, fecha: Date }],
  categorias: [String],
  prioridad: { type: Number, default: 1 },
  evaluado: { type: Boolean, default: false },
  evaluador: { type: String },
  historialCambios: [{ fecha: Date, autor: String, cambio: String }]
});

const Sugerencia = mongoose.model('Sugerencia', sugerenciaSchema);

module.exports = Sugerencia;
