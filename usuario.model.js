import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'operador'], default: 'operador' }
});

export const Usuario = mongoose.model('Usuario', usuarioSchema);
