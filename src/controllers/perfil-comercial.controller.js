const db = require('../config/db');

const USER_ID_TEMPORAL = 2;
const BUSINESS_ID_TEMPORAL = 1;

exports.renderPerfilComercialPage = (req, res) => {
  const businessID = BUSINESS_ID_TEMPORAL;

  const usuarioQuery = `
    SELECT userID, firstName, profileImageURL
    FROM Users
    WHERE userID = ? AND roleID = 2
    LIMIT 1
  `;

  const profileQuery = `
    SELECT
      businessID,
      businessName,
      description,
      logoURL,
      department,
      city,
      addressLine,
      contactPhone,
      contactEmail,
      instagram,
      facebook,
      tiktok
    FROM BusinessProfiles
    WHERE businessID = ?
    LIMIT 1
  `;

  const subscriptionQuery = `
    SELECT
      s.subscriptionID,
      s.startDate,
      s.endDate,
      p.planName,
      p.featuredAds
    FROM Subscriptions s
    INNER JOIN Plans p ON p.planID = s.planID
    WHERE s.businessID = ?
    ORDER BY s.subscriptionID DESC
    LIMIT 1
  `;

  const hoursQuery = `
    SELECT
      businessHourID,
      dayOfWeek,
      isClosed,
      openTime,
      closeTime
    FROM BusinessHours
    WHERE businessID = ?
    ORDER BY FIELD(
      dayOfWeek,
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo'
    )
  `;

  db.query(usuarioQuery, [USER_ID_TEMPORAL], (usuarioError, usuarioRows) => {
    if (usuarioError) {
      console.error('Error al obtener usuario:', usuarioError);
      return res.status(500).send('Error al cargar perfil comercial');
    }

    const usuario = usuarioRows[0] || null;

    db.query(profileQuery, [businessID], (profileError, profileRows) => {
      if (profileError) {
        console.error('Error al obtener perfil comercial:', profileError);
        return res.status(500).send('Error al cargar perfil comercial');
      }

      const businessProfile = profileRows[0] || null;

      db.query(subscriptionQuery, [businessID], (subscriptionError, subscriptionRows) => {
        if (subscriptionError) {
          console.error('Error al obtener suscripción:', subscriptionError);
          return res.status(500).send('Error al cargar perfil comercial');
        }

        const subscription = subscriptionRows[0] || null;

        db.query(hoursQuery, [businessID], (hoursError, businessHours) => {
          if (hoursError) {
            console.error('Error al obtener horarios:', hoursError);
            return res.status(500).send('Error al cargar perfil comercial');
          }

          return res.render('emprendedor/perfil-comercial', {
            activePage: 'perfil',
            usuario,
            businessProfile,
            subscription,
            businessHours
          });
        });
      });
    });
  });
};

exports.updateBusinessProfile = (req, res) => {
  const businessID = BUSINESS_ID_TEMPORAL;

  const {
    businessName,
    description,
    logoURL,
    department,
    city,
    addressLine,
    contactPhone,
    contactEmail,
    instagram,
    facebook,
    tiktok
  } = req.body;

  const query = `
    UPDATE BusinessProfiles
    SET
      businessName = ?,
      description = ?,
      logoURL = ?,
      department = ?,
      city = ?,
      addressLine = ?,
      contactPhone = ?,
      contactEmail = ?,
      instagram = ?,
      facebook = ?,
      tiktok = ?
    WHERE businessID = ?
  `;

  const values = [
    businessName,
    description,
    logoURL,
    department,
    city,
    addressLine,
    contactPhone,
    contactEmail,
    instagram || null,
    facebook || null,
    tiktok || null,
    businessID
  ];

  db.query(query, values, (error, result) => {
    if (error) {
      console.error('Error al actualizar perfil comercial:', error);
      return res.status(500).json({ error: 'Error al actualizar perfil comercial' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    return res.json({ message: 'Perfil comercial actualizado correctamente' });
  });
};

exports.updateBusinessHours = (req, res) => {
  const businessID = BUSINESS_ID_TEMPORAL;
  const { hours } = req.body;

  if (!Array.isArray(hours) || hours.length === 0) {
    return res.status(400).json({ error: 'No se recibieron horarios válidos' });
  }

  const updates = hours.map((item) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE BusinessHours
        SET
          isClosed = ?,
          openTime = ?,
          closeTime = ?
        WHERE businessID = ? AND dayOfWeek = ?
      `;

      const values = [
        item.isClosed ? 1 : 0,
        item.isClosed ? null : item.openTime || null,
        item.isClosed ? null : item.closeTime || null,
        businessID,
        item.dayOfWeek
      ];

      db.query(query, values, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  });

  Promise.all(updates)
    .then(() => {
      res.json({ message: 'Horarios actualizados correctamente' });
    })
    .catch((error) => {
      console.error('Error al actualizar horarios:', error);
      res.status(500).json({ error: 'Error al actualizar horarios' });
    });
};