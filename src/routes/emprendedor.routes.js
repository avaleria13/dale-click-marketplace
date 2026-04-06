const express = require('express');
const path = require('path');

const router = express.Router();

// Estas rutas por ahora solo sirven HTML estático
router.get('/tablero', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'emprendedor', 'tablero.html'));
});

router.get('/productos', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'emprendedor', 'productos.html'));
});

router.get('/pedidos', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'emprendedor', 'pedidos.html'));
});

router.get('/perfil-comercial', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'emprendedor', 'perfil-comercial.html'));
});

router.get('/clientes', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'emprendedor', 'clientes.html'));
});

router.get('/ventas', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'emprendedor', 'ventas.html'));
});

module.exports = router;