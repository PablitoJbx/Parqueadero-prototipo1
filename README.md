# Sistema de Parqueadero (Prototipo)

Este es un prototipo de sistema de parqueadero usando Node.js, Express y MongoDB.

## Endpoints principales
- `POST /entrada` — Registra la entrada de un vehículo.
- `POST /salida` — Registra la salida de un vehículo.
- `GET /parqueadero` — Lista los vehículos actualmente en el parqueadero.

## Configuración
1. Crea un archivo `.env` con tu cadena de conexión de MongoDB:
   
   ```env
   MONGODB_URI=tu_cadena_de_conexion_mongodb
   PORT=3000
   ```

2. Instala las dependencias:
   ```sh
   npm install
   ```

3. Inicia el servidor:
   ```sh
   npm start
   ```

## Despliegue en Render
- Sube este repositorio a GitHub.
- Crea un nuevo servicio web en Render y conecta tu repo.
- Configura la variable de entorno `MONGODB_URI` en Render.
- Render detectará el comando `npm start` automáticamente.
