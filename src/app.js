const express = require('express');
const path = require('path');

const app = express();

const tableroRoutes = require('./routes/tablero');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const perfilComercialRoutes = require('./routes/perfil-comercial');
const clientesRoutes = require('./routes/clientes');
const configuracionRoutes = require('./routes/configuracion');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/tablero');
});

app.use((req, res, next) => {
  res.locals.usuario = null;
  next();
});

/*app.use((req, res, next) => {
  res.locals.usuario = {
    profileImageURL: '/images/perfil-usuario.png'
  };
  next();
});*/

app.use('/tablero', tableroRoutes);
app.use('/productos', productosRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/perfil-comercial', perfilComercialRoutes);
app.use('/clientes', clientesRoutes);
app.use('/configuracion', configuracionRoutes);

module.exports = app;