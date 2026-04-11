const db = require('../config/db');
const transporter = require('../config/mailer');

const USER_ID_TEMPORAL = 2;
const BUSINESS_ID_TEMPORAL = 1;

function formatDateToISO(dateValue) {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().split('T')[0];
}

function calcularSegmento(totalPedidos, ultimaCompra) {
  if (!ultimaCompra) return 'At-Risk';

  const fechaCompra = new Date(ultimaCompra);
  const hoy = new Date();
  const diferenciaDias = Math.floor((hoy - fechaCompra) / (1000 * 60 * 60 * 24));

  if (Number(totalPedidos) <= 1) {
    return 'Nuevo';
  }

  if (diferenciaDias <= 60) {
    return 'Activo';
  }

  return 'At-Risk';
}

function transformarClientes(rows) {
  return rows.map((cliente) => {
    const totalPedidos = Number(cliente.totalPedidos || 0);
    const gastoTotal = Number(cliente.gastoTotal || 0);
    const ultimaCompraISO = formatDateToISO(cliente.ultimaCompra);
    const segmento = calcularSegmento(totalPedidos, cliente.ultimaCompra);

    return {
      userID: cliente.userID,
      clientCode: `CL${String(cliente.userID).padStart(4, '0')}`,
      firstName: cliente.firstName,
      lastName: cliente.lastName,
      email: cliente.email,
      phone: cliente.phone,
      totalPedidos,
      gastoTotal,
      ultimaCompra: ultimaCompraISO,
      segmento
    };
  });
}

exports.renderClientesPage = (req, res) => {
  const businessID = BUSINESS_ID_TEMPORAL;

  const usuarioQuery = `
    SELECT userID, firstName, profileImageURL
    FROM Users
    WHERE userID = ? AND roleID = 2
    LIMIT 1
  `;

  const query = `
    SELECT
      u.userID,
      u.firstName,
      u.lastName,
      u.email,
      u.phone,
      COUNT(DISTINCT o.orderID) AS totalPedidos,
      COALESCE(SUM(od.quantity * od.unitPrice), 0) AS gastoTotal,
      MAX(o.orderDate) AS ultimaCompra
    FROM Orders o
    INNER JOIN Users u ON u.userID = o.userID
    INNER JOIN OrderDetails od ON od.orderID = o.orderID
    WHERE o.businessID = ?
      AND u.roleID = 1
    GROUP BY
      u.userID,
      u.firstName,
      u.lastName,
      u.email,
      u.phone
    ORDER BY MAX(o.orderDate) DESC, u.firstName ASC, u.lastName ASC
  `;

  db.query(usuarioQuery, [USER_ID_TEMPORAL], (errorUsuario, usuarioRows) => {
    if (errorUsuario) {
      console.error('Error al obtener usuario:', errorUsuario);
      return res.status(500).send('Error al cargar clientes');
    }

    const usuario = usuarioRows[0] || null;

    db.query(query, [businessID], (error, rows) => {
      if (error) {
        console.error('Error al obtener clientes:', error);
        return res.status(500).send('Error al cargar clientes');
      }

      const clientes = transformarClientes(rows);

      return res.render('emprendedor/clientes', {
        activePage: 'clientes',
        usuario,
        clientes,
        segmentos: ['Activo', 'Nuevo', 'At-Risk'],
        rangosFecha: [
          { value: '30', label: 'Últimos 30 días' },
          { value: '60', label: 'Últimos 60 días' },
          { value: '90', label: 'Últimos 90 días' }
        ],
        ordenes: [
          { value: 'gasto-desc', label: 'Gasto total (mayor a menor)' },
          { value: 'gasto-asc', label: 'Gasto total (menor a mayor)' },
          { value: 'pedidos-desc', label: 'Pedidos (mayor a menor)' },
          { value: 'fecha-desc', label: 'Última compra (más reciente)' },
          { value: 'fecha-asc', label: 'Última compra (más antigua)' }
        ]
      });
    });
  });
};

exports.getClientes = (req, res) => {
  const businessID = BUSINESS_ID_TEMPORAL;

  const query = `
    SELECT
      u.userID,
      u.firstName,
      u.lastName,
      u.email,
      u.phone,
      COUNT(DISTINCT o.orderID) AS totalPedidos,
      COALESCE(SUM(od.quantity * od.unitPrice), 0) AS gastoTotal,
      MAX(o.orderDate) AS ultimaCompra
    FROM Orders o
    INNER JOIN Users u ON u.userID = o.userID
    INNER JOIN OrderDetails od ON od.orderID = o.orderID
    WHERE o.businessID = ?
      AND u.roleID = 1
    GROUP BY
      u.userID,
      u.firstName,
      u.lastName,
      u.email,
      u.phone
    ORDER BY MAX(o.orderDate) DESC, u.firstName ASC, u.lastName ASC
  `;

  db.query(query, [businessID], (error, rows) => {
    if (error) {
      console.error('Error al obtener clientes:', error);
      return res.status(500).json({ error: 'Error al obtener clientes' });
    }

    return res.json(transformarClientes(rows));
  });
};

exports.getSegmentos = (req, res) => {
  return res.json([
    { value: 'Activo', label: 'Activo' },
    { value: 'Nuevo', label: 'Nuevo' },
    { value: 'At-Risk', label: 'At-Risk' }
  ]);
};

exports.contactarCliente = async (req, res) => {
  const { clientEmail, subject, message } = req.body;

  if (!clientEmail || !subject || !message) {
    return res.status(400).json({ error: 'Faltan datos para enviar el correo' });
  }

  const businessQuery = `
    SELECT businessName, contactEmail
    FROM BusinessProfiles
    WHERE businessID = ?
    LIMIT 1
  `;

  db.query(businessQuery, [BUSINESS_ID_TEMPORAL], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener datos del negocio' });
    }

    const negocio = rows[0];
    const sellerEmail = negocio.contactEmail;
    const businessName = negocio.businessName;

    try {
      await transporter.sendMail({
        from: `"Dale Click" <${process.env.EMAIL_USER}>`,
        to: clientEmail,
        replyTo: sellerEmail,
        subject,
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Mensaje de ${businessName}</h2>
            <p><strong>Negocio:</strong> ${businessName}</p>
            <p><strong>Correo del negocio:</strong> ${sellerEmail}</p>
            <hr>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p style="font-size: 0.9rem; color: #666;">
              Este mensaje fue enviado a través de Dale Click.
              Puedes responder directamente a este correo para contactar al negocio.
            </p>
          </div>
        `
      });

      return res.json({ message: 'Correo enviado correctamente.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'No se pudo enviar el correo.' });
    }
  });
};