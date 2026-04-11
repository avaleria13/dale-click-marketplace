const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.showLogin = (req, res) => {
  res.render('auth/login');
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.send('Usuario no encontrado');
    }

    const user = rows[0];

    // ⚠️ TEMPORAL (porque en tu DB no está hasheado aún)
    if (password !== user.password) {
      return res.send('Contraseña incorrecta');
    }

    // Guardar en sesión
    req.session.usuario = user;

    // Redirección por rol
    if (role === 'admin') {
      return res.redirect('/emprendedor/tablero');
    }

    if (role === 'vendedor') {
      return res.redirect('/emprendedor/tablero');
    }

  } catch (error) {
    console.log(error);
    res.send('Error en login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};