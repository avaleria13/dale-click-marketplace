const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para leer formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'emprendedor', 'tablero.html'));
});

// Rutas del portal emprendedor
app.get('/productos', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'emprendedor', 'productos.html'));
});

app.get('/pedidos', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'emprendedor', 'pedidos.html'));
});

app.get('/perfil-comercial', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'emprendedor', 'perfil-comercial.html'));
});

app.get('/clientes', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'emprendedor', 'clientes.html'));
});

app.get('/ventas', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'emprendedor', 'ventas.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});