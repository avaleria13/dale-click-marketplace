const db = require('../config/db');
const transporter = require('../config/mailer');

const USER_ID_TEMPORAL = 2;
const BUSINESS_ID_TEMPORAL = 1;

exports.renderConfiguracionPage = (req, res) => {
  const userID = USER_ID_TEMPORAL;
  const businessID = BUSINESS_ID_TEMPORAL;

  const usuarioQuery = `
    SELECT
      userID,
      username,
      firstName,
      lastName,
      email,
      phone,
      nationalID,
      password,
      profileImageURL
    FROM Users
    WHERE userID = ? AND roleID = 2
    LIMIT 1
  `;

  const studentProfileQuery = `
    SELECT
      sp.studentIDCode,
      sp.career,
      sp.isStudentVerified,
      u.universityName
    FROM StudentProfiles sp
    INNER JOIN Universities u ON u.universityID = sp.universityID
    WHERE sp.userID = ?
    LIMIT 1
  `;

  const businessProfileQuery = `
    SELECT
      businessID,
      userID,
      businessName,
      description,
      logoURL,
      department,
      city,
      addressLine,
      referenceNote,
      contactPhone,
      contactEmail,
      instagram,
      facebook,
      tiktok,
      status
    FROM BusinessProfiles
    WHERE businessID = ? AND userID = ?
    LIMIT 1
  `;

  const planesQuery = `
    SELECT
      planID,
      planName,
      price,
      durationDays
    FROM Plans
    ORDER BY price ASC, planID ASC
  `;

  const historialQuery = `
    SELECT
      s.subscriptionID,
      p.planName,
      s.startDate,
      s.endDate,
      s.status
    FROM Subscriptions s
    INNER JOIN Plans p ON p.planID = s.planID
    WHERE s.businessID = ?
    ORDER BY s.subscriptionID DESC
  `;

  db.query(usuarioQuery, [userID], (usuarioError, usuarioRows) => {
    if (usuarioError) {
      console.error('Error al obtener usuario:', usuarioError);
      return res.status(500).send('Error al cargar configuración');
    }

    const usuario = usuarioRows[0] || null;

    db.query(studentProfileQuery, [userID], (studentError, studentRows) => {
      if (studentError) {
        console.error('Error al obtener perfil estudiante:', studentError);
        return res.status(500).send('Error al cargar configuración');
      }

      const studentProfile = studentRows[0] || null;

      db.query(businessProfileQuery, [businessID, userID], (businessError, businessRows) => {
        if (businessError) {
          console.error('Error al obtener perfil comercial:', businessError);
          return res.status(500).send('Error al cargar configuración');
        }

        const businessProfile = businessRows[0] || null;

        db.query(planesQuery, (planesError, planesRows) => {
          if (planesError) {
            console.error('Error al obtener planes:', planesError);
            return res.status(500).send('Error al cargar configuración');
          }

          db.query(historialQuery, [businessID], (historialError, historialRows) => {
            if (historialError) {
              console.error('Error al obtener historial:', historialError);
              return res.status(500).send('Error al cargar configuración');
            }

            return res.render('emprendedor/configuracion', {
              activePage: 'configuracion',
              usuario,
              studentProfile,
              businessProfile,
              planes: planesRows || [],
              historialSuscripciones: historialRows || []
            });
          });
        });
      });
    });
  });
};

exports.updateUsuario = (req, res) => {
  const userID = USER_ID_TEMPORAL;
  const businessID = BUSINESS_ID_TEMPORAL;

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    instagram,
    facebook,
    tiktok
  } = req.body;

  const updateUserQuery = `
    UPDATE Users
    SET
      firstName = ?,
      lastName = ?,
      email = ?,
      phone = ?,
      password = ?
    WHERE userID = ? AND roleID = 2
  `;

  const updateBusinessProfileQuery = `
    UPDATE BusinessProfiles
    SET
      instagram = ?,
      facebook = ?,
      tiktok = ?
    WHERE businessID = ? AND userID = ?
  `;

  db.query(
    updateUserQuery,
    [firstName, lastName, email, phone, password, userID],
    (userError, userResult) => {
      if (userError) {
        console.error('Error al actualizar usuario:', userError);
        return res.status(500).json({ error: 'Error al actualizar usuario' });
      }

      if (userResult.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      db.query(
        updateBusinessProfileQuery,
        [
          instagram || null,
          facebook || null,
          tiktok || null,
          businessID,
          userID
        ],
        (businessError) => {
          if (businessError) {
            console.error('Error al actualizar redes del negocio:', businessError);
            return res.status(500).json({ error: 'Error al actualizar redes sociales' });
          }

          return res.json({ message: 'Usuario actualizado correctamente' });
        }
      );
    }
  );
};

exports.updateFotoPerfil = (req, res) => {
  const userID = USER_ID_TEMPORAL;

  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen' });
  }

  const imagePath = `/uploads/perfiles/${req.file.filename}`;

  const query = `
    UPDATE Users
    SET profileImageURL = ?
    WHERE userID = ? AND roleID = 2
  `;

  db.query(query, [imagePath, userID], (error, result) => {
    if (error) {
      console.error('Error al actualizar foto de perfil:', error);
      return res.status(500).json({ error: 'Error al actualizar foto de perfil' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json({
      message: 'Foto de perfil actualizada correctamente',
      profileImageURL: imagePath
    });
  });
};

exports.solicitarPlan = (req, res) => {
  const userID = USER_ID_TEMPORAL;
  const businessID = BUSINESS_ID_TEMPORAL;
  const { planID, planName, message } = req.body;

  const negocioQuery = `
    SELECT
      bp.businessName,
      bp.contactEmail,
      u.firstName,
      u.lastName,
      u.email
    FROM BusinessProfiles bp
    INNER JOIN Users u ON u.userID = bp.userID
    WHERE bp.businessID = ? AND u.userID = ?
    LIMIT 1
  `;

  db.query(negocioQuery, [businessID, userID], async (error, rows) => {
    if (error) {
      console.error('Error al obtener negocio para solicitar plan:', error);
      return res.status(500).json({ error: 'Error al procesar solicitud' });
    }

    const negocio = rows[0];
    if (!negocio) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    try {
      await transporter.sendMail({
        from: `"Dale Click" <${process.env.EMAIL_USER}>`,
        to: 'daleclick26@gmail.com',
        replyTo: negocio.contactEmail || negocio.email,
        subject: `Solicitud de plan: ${planName}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Solicitud de suscripción</h2>
            <p><strong>Plan solicitado:</strong> ${planName}</p>
            <p><strong>ID del plan:</strong> ${planID}</p>
            <p><strong>Negocio:</strong> ${negocio.businessName || 'N/D'}</p>
            <p><strong>Emprendedor:</strong> ${negocio.firstName || ''} ${negocio.lastName || ''}</p>
            <p><strong>Correo de contacto:</strong> ${negocio.contactEmail || negocio.email || 'N/D'}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${(message || '').replace(/\n/g, '<br>')}</p>
          </div>
        `
      });

      return res.json({ message: 'Solicitud enviada correctamente a Dale Click.' });
    } catch (mailError) {
      console.error('Error al enviar solicitud de plan:', mailError);
      return res.status(500).json({ error: 'No se pudo enviar la solicitud del plan' });
    }
  });
};