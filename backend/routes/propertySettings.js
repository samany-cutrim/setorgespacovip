const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/property-settings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM property_settings LIMIT 1');
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar configurações do imóvel' });
  }
});

// POST /api/property-settings
router.post('/', async (req, res) => {
  const { name, description, max_guests, amenities, images } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO property_settings (name, description, max_guests, amenities, images, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [name, description, max_guests, amenities, images]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar configurações do imóvel' });
  }
});

// PUT /api/property-settings/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, max_guests, amenities, images } = req.body;
  try {
    const result = await pool.query(
      'UPDATE property_settings SET name = $1, description = $2, max_guests = $3, amenities = $4, images = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [name, description, max_guests, amenities, images, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar configurações do imóvel' });
  }
});

module.exports = router;
