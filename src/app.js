const express = require('express');
const path = require('path');

const app = express();

const productosRoutes = require('./routes/productos');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/productos');
});

app.get('/pedidos', (req, res) => {
  res.render('emprendedor/pedidos', { activePage: 'pedidos' });
});

app.get('/perfil-comercial', (req, res) => {
  res.render('emprendedor/perfil-comercial', { activePage: 'perfil' });
});

app.get('/clientes', (req, res) => {
  res.render('emprendedor/clientes', { activePage: 'clientes' });
});

app.get('/configuracion', (req, res) => {
  res.render('emprendedor/configuracion', { activePage: 'configuracion' });
});

app.use('/productos', productosRoutes);

module.exports = app;