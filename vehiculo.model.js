import mongoose from 'mongoose';

const vehiculoSchema = new mongoose.Schema({
  placa: { type: String, required: true },
  tipo: { type: String, required: true },
  horaEntrada: { type: Date, required: true },
  horaSalida: { type: Date, default: null }
});

export const Vehiculo = mongoose.model('Vehiculo', vehiculoSchema);
