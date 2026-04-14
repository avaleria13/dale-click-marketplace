const db = require('../config/db');

exports.showLogin = (req, res) => {
  res.render('auth/login', {
    showReset: false,
    role: '',
    errorReset: null,
    successReset: null
  });
};

exports.login = (req, res) => {
  const { email, password, role } = req.body || {};

  console.log('BODY:', req.body);

  if (!email || !password || !role) {
    return res.status(400).send('Debes completar email, contraseña y seleccionar un rol.');
  }

  db.query(
    'SELECT * FROM Users WHERE email = ?',
    [email],
    (error, rows) => {
      if (error) {
        console.error('Error en query:', error);
        return res.status(500).send('Error en login');
      }

      console.log('ROWS:', rows);

      if (rows.length === 0) {
        return res.status(404).send('Usuario no encontrado');
      }

      const user = rows[0];

      if (password !== user.password) {
        return res.status(401).send('Contraseña incorrecta');
      }

      const expectedRoleId = role === 'vendedor' ? 2 : 3;

      if (user.roleID !== expectedRoleId) {
        return res.status(403).send('Este usuario no corresponde al panel seleccionado.');
      }

      req.session.usuario = user;

      req.session.save((err) => {
        if (err) {
          console.error('Error guardando sesión:', err);
          return res.status(500).send('Error guardando sesión');
        }

        console.log('Login OK → redirigiendo a /tablero');
        return res.redirect('/tablero');
      });
    }
  );
};

exports.resetPasswordSimple = (req, res) => {
  const {
    resetEmail,
    resetPassword,
    resetConfirmPassword,
    resetRole
  } = req.body || {};

  if (!resetEmail || !resetPassword || !resetConfirmPassword || !resetRole) {
    return res.render('auth/login', {
      errorReset: 'Debes completar todos los campos.',
      showReset: true,
      role: resetRole || '',
      successReset: null
    });
  }

  if (resetPassword !== resetConfirmPassword) {
    return res.render('auth/login', {
      errorReset: 'Las contraseñas no coinciden.',
      showReset: true,
      role: resetRole || '',
      successReset: null
    });
  }

  if (resetPassword.length < 4) {
    return res.render('auth/login', {
      errorReset: 'La contraseña debe tener al menos 4 caracteres.',
      showReset: true,
      role: resetRole || '',
      successReset: null
    });
  }

  const expectedRoleId = resetRole === 'vendedor' ? 2 : 3;

  db.query(
    'SELECT * FROM Users WHERE email = ? AND roleID = ?',
    [resetEmail, expectedRoleId],
    (error, rows) => {
      if (error) {
        console.error('Error consultando usuario para reset:', error);
        return res.render('auth/login', {
          errorReset: 'Error del servidor.',
          showReset: true,
          role: resetRole || '',
          successReset: null
        });
      }

      if (rows.length === 0) {
        return res.render('auth/login', {
          errorReset: 'No existe un usuario con ese correo en el panel seleccionado.',
          showReset: true,
          role: resetRole || '',
          successReset: null
        });
      }

      db.query(
        'UPDATE Users SET password = ? WHERE email = ? AND roleID = ?',
        [resetPassword, resetEmail, expectedRoleId],
        (updateError) => {
          if (updateError) {
            console.error('Error actualizando contraseña:', updateError);
            return res.render('auth/login', {
              errorReset: 'No se pudo actualizar la contraseña.',
              showReset: true,
              role: resetRole || '',
              successReset: null
            });
          }

          return res.render('auth/login', {
            successReset: 'Contraseña actualizada correctamente. Ahora puedes iniciar sesión.',
            showReset: false,
            role: resetRole || '',
            errorReset: null
          });
        }
      );
    }
  );
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};