import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Vehiculo } from './vehiculo.model.js';
import { Usuario } from './usuario.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

// Registro de usuario
app.post('/register', async (req, res) => {
  try {
    const { username, password, rol } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    const existe = await Usuario.findOne({ username });
    if (existe) return res.status(400).json({ error: 'Usuario ya existe' });
    const hash = await bcrypt.hash(password, 10);
    const user = new Usuario({ username, password: hash, rol: rol || 'operador' });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login de usuario
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Usuario.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
    const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET || 'secreto', { expiresIn: '8h' });
    res.json({ token, username: user.username, rol: user.rol });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware de autenticación
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No autenticado' });
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// Endpoint para consultar historial de movimientos (admin)
app.get('/historial', auth, async (req, res) => {
  try {
    if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Solo admin' });
    const vehiculos = await Vehiculo.find().sort({ horaEntrada: -1 });
    res.json(vehiculos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para consultar y actualizar tarifas (admin)
let tarifas = { carro: 2000, moto: 1000 };
app.get('/tarifas', auth, (req, res) => {
  res.json(tarifas);
});
app.post('/tarifas', auth, (req, res) => {
  if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Solo admin' });
  const { carro, moto } = req.body;
  if (carro) tarifas.carro = carro;
  if (moto) tarifas.moto = moto;
  res.json(tarifas);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
