const express = require('express');
const pool = require('../db');

const router = express.Router();

const getStatus = (quantity) => {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= 5) return 'low_stock';
  return 'in_stock';
};

// GET /products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM products ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /products/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }   
    res.json(result.rows);  

  } catch (error) {
    console.error( error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /products
router.post('/', async (req, res) => {
  try {
    const { name, quantity = 0, price = 0, description = null } = req.body;

    if (!name || typeof name !== 'string' || !name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }   

    if (Number(quantity) < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    if (Number(price) < 0) {
      return res.status(400).json({ error: 'Price cannot be negative' });
    }    
    const status = getStatus(Number(quantity));

    try {
      const result = await pool.query(
      `
        INSERT INTO products (
          name,
          quantity,
          price,
          status,
          description
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          *
      `,
      [name, quantity, price, status, description]
    );

    res.status(201).json(formatProduct(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PATCH /products/:id
router.patch('/:id', async (req, res) => {
  
    const { id } =req.params;
    const { name, quantity, price, description } = req.body;

    if (quantity !== undefined && Number(quantity) < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({ error: 'Price cannot be negative' });
    } 
  
    try {
        const existingResult = await pool.query(`SELECT * FROM products WHERE id = $1`);
        if (existingResult.rows.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }        

        const current = existingResult.rows[0];
        const newName = name !== undefined ? name.trim() : current.name;
        const newQuantity = quantity !== undefined ? Number(quantity) : current.quantity;
        const newPrice = price !== undefined ? Number(price) : current.price;
        const newDescription = description !== undefined ? description : current.description;
        const newStatus = getStatus(newQuantity);

        const result = await pool.query(
          `
            UPDATE products
            SET name = $1,
                quantity = $2,
                price = $3,
                status = $4,
                description = $5,
                updated_at = NOW()
            WHERE id = $6
            RETURNING *
          `,
          [
            newName,
            newQuantity,
            newPrice,
            newStatus,
            newDescription,
            id
          ]
        );

        res.json(result.rows[0]);
      } catch (error) {
        console.error( error);
        res.status(500).json({ error: 'Failed to update product' });
      }
    });

// DELETE /products/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        DELETE FROM products
        WHERE id = $1
        RETURNING *
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error( error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;