const db = require('../config/db');

exports.renderProductosPage = (req, res) => {
  const categoriasQuery = `
    SELECT categoryID, categoryName
    FROM Categories
    ORDER BY categoryName ASC
  `;

  const productosQuery = `
    SELECT
      p.productID,
      p.businessID,
      p.categoryID,
      p.productName,
      p.description,
      p.price,
      p.stock,
      p.availabilityStatus,
      p.createdAt,
      p.updatedAt,
      c.categoryName,
      (
        SELECT pi.imageURL
        FROM ProductImages pi
        WHERE pi.productID = p.productID
        ORDER BY pi.imageID DESC
        LIMIT 1
      ) AS imageURL
    FROM Products p
    INNER JOIN Categories c ON c.categoryID = p.categoryID
    ORDER BY p.productID DESC
  `;

  db.query(categoriasQuery, (errorCategorias, categorias) => {
    if (errorCategorias) {
      console.error('Error al obtener categorías:', errorCategorias);
      return res.status(500).send('Error al cargar categorías');
    }

    db.query(productosQuery, (errorProductos, productos) => {
      if (errorProductos) {
        console.error('Error al obtener productos:', errorProductos);
        return res.status(500).send('Error al cargar productos');
      }

      return res.render('emprendedor/productos', {
        activePage: 'productos',
        categorias,
        estados: ['Disponible', 'No disponible'],
        productos
      });
    });
  });
};

exports.getCategorias = (req, res) => {
  const query = `
    SELECT categoryID, categoryName
    FROM Categories
    ORDER BY categoryName ASC
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener categorías:', error);
      return res.status(500).json({ error: 'Error al obtener categorías' });
    }

    return res.json(results);
  });
};

exports.getEstados = (req, res) => {
  return res.json([
    { value: 'Disponible', label: 'Disponible' },
    { value: 'No disponible', label: 'No disponible' }
  ]);
};

exports.getProductos = (req, res) => {
  const query = `
    SELECT
      p.productID,
      p.businessID,
      p.categoryID,
      p.productName,
      p.description,
      p.price,
      p.stock,
      p.availabilityStatus,
      p.createdAt,
      p.updatedAt,
      c.categoryName,
      (
        SELECT pi.imageURL
        FROM ProductImages pi
        WHERE pi.productID = p.productID
        ORDER BY pi.imageID DESC
        LIMIT 1
      ) AS imageURL
    FROM Products p
    INNER JOIN Categories c ON c.categoryID = p.categoryID
    ORDER BY p.productID DESC
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({ error: 'Error al obtener productos' });
    }

    return res.json(results);
  });
};

exports.createProducto = (req, res) => {
  const {
    businessID,
    categoryID,
    productName,
    description,
    price,
    stock,
    availabilityStatus
  } = req.body;

  const query = `
    INSERT INTO Products (
      businessID,
      categoryID,
      productName,
      description,
      price,
      stock,
      availabilityStatus,
      createdAt,
      updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    businessID,
    categoryID,
    productName,
    description,
    price,
    stock,
    availabilityStatus
  ];

  db.query(query, values, (error, result) => {
    if (error) {
      console.error('Error al crear producto:', error);
      return res.status(500).json({ error: 'Error al crear producto' });
    }

    return res.status(201).json({
      message: 'Producto creado correctamente',
      productID: result.insertId
    });
  });
};

exports.updateProducto = (req, res) => {
  const { id } = req.params;
  const {
    categoryID,
    productName,
    description,
    price,
    stock,
    availabilityStatus
  } = req.body;

  const query = `
    UPDATE Products
    SET
      categoryID = ?,
      productName = ?,
      description = ?,
      price = ?,
      stock = ?,
      availabilityStatus = ?,
      updatedAt = NOW()
    WHERE productID = ?
  `;

  const values = [
    categoryID,
    productName,
    description,
    price,
    stock,
    availabilityStatus,
    id
  ];

  db.query(query, values, (error, result) => {
    if (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(500).json({ error: 'Error al actualizar producto' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.json({ message: 'Producto actualizado correctamente' });
  });
};

exports.deleteProducto = (req, res) => {
  const { id } = req.params;

  const deleteImagesQuery = `
    DELETE FROM ProductImages
    WHERE productID = ?
  `;

  const deleteProductQuery = `
    DELETE FROM Products
    WHERE productID = ?
  `;

  db.query(deleteImagesQuery, [id], (errorImages) => {
    if (errorImages) {
      console.error('Error al borrar imágenes del producto:', errorImages);
      return res.status(500).json({ error: 'Error al borrar producto' });
    }

    db.query(deleteProductQuery, [id], (errorProduct, result) => {
      if (errorProduct) {
        console.error('Error al borrar producto:', errorProduct);
        return res.status(500).json({ error: 'Error al borrar producto' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      return res.json({ message: 'Producto eliminado correctamente' });
    });
  });
};

exports.getImagenes = (req, res) => {
  const query = `
    SELECT imageID, productID, imageURL
    FROM ProductImages
    ORDER BY imageID DESC
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener imágenes:', error);
      return res.status(500).json({ error: 'Error al obtener imágenes' });
    }

    return res.json(results);
  });
};

exports.addImagenProducto = (req, res) => {
  const { productID, imageURL } = req.body;

  const query = `
    INSERT INTO ProductImages (productID, imageURL)
    VALUES (?, ?)
  `;

  db.query(query, [productID, imageURL], (error, result) => {
    if (error) {
      console.error('Error al agregar imagen:', error);
      return res.status(500).json({ error: 'Error al agregar imagen' });
    }

    return res.status(201).json({
      message: 'Imagen agregada correctamente',
      imageID: result.insertId
    });
  });
};

exports.updateImagenProducto = (req, res) => {
  const { id } = req.params;
  const { productID, imageURL } = req.body;

  const query = `
    UPDATE ProductImages
    SET productID = ?, imageURL = ?
    WHERE imageID = ?
  `;

  db.query(query, [productID, imageURL, id], (error, result) => {
    if (error) {
      console.error('Error al actualizar imagen:', error);
      return res.status(500).json({ error: 'Error al actualizar imagen' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    return res.json({ message: 'Imagen actualizada correctamente' });
  });
};

exports.deleteImagenProducto = (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM ProductImages
    WHERE imageID = ?
  `;

  db.query(query, [id], (error, result) => {
    if (error) {
      console.error('Error al borrar imagen:', error);
      return res.status(500).json({ error: 'Error al borrar imagen' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    return res.json({ message: 'Imagen eliminada correctamente' });
  });
};