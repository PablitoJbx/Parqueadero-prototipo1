import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Vehiculo } from './vehiculo.model.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parqueadero', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Endpoint para registrar entrada de vehículo
app.post('/entrada', async (req, res) => {
  try {
    const { placa, tipo } = req.body;
    const vehiculo = new Vehiculo({ placa, tipo, horaEntrada: new Date() });
    await vehiculo.save();
    res.status(201).json(vehiculo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para registrar salida de vehículo
app.post('/salida', async (req, res) => {
  try {
    const { placa } = req.body;
    const vehiculo = await Vehiculo.findOneAndUpdate(
      { placa, horaSalida: null },
      { horaSalida: new Date() },
      { new: true }
    );
    if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado o ya salió.' });
    res.json(vehiculo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para consultar vehículos en el parqueadero
app.get('/parqueadero', async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find({ horaSalida: null });
    res.json(vehiculos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
