const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('emprendedor/tablero', { activePage: 'tablero' });
});

app.get('/productos', (req, res) => {
  res.render('emprendedor/productos', { activePage: 'productos' });
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});