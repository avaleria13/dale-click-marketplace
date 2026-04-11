const express = require('express');
const path = require('path');

const app = express();

/*Login*/
const session = require('express-session');
app.use(session({
  secret: 'daleclick-secret',
  resave: false,
  saveUninitialized: false
}));

const tableroRoutes = require('./routes/tablero');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const perfilComercialRoutes = require('./routes/perfil-comercial');
const clientesRoutes = require('./routes/clientes');
const configuracionRoutes = require('./routes/configuracion');

/*Login + */
const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/*
YA NO DEBE ABRIR TABLERO DE PRIMERO
app.get('/', (req, res) => {
  res.redirect('/tablero');
});*/

app.use((req, res, next) => {
  res.locals.usuario = null;
  next();
});

app.get('/', (req, res) => {
  if (req.session.usuario) {
    return res.redirect('/emprendedor/tablero');
  } else {
    return res.redirect('/login');
  }
});

/*Hacer usuario global*/
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

app.use('/tablero', tableroRoutes);
app.use('/productos', productosRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/perfil-comercial', perfilComercialRoutes);
app.use('/clientes', clientesRoutes);
app.use('/configuracion', configuracionRoutes);

module.exports = app;