const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/pricing-rules
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pricing_rules ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar regras de preço' });
  }
});

// POST /api/pricing-rules
router.post('/', async (req, res) => {
  const { name, price_type, daily_rate, min_nights, start_date, end_date, is_active } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pricing_rules (name, price_type, daily_rate, min_nights, start_date, end_date, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
      [name, price_type, daily_rate, min_nights, start_date, end_date, is_active]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar regra de preço' });
  }
});

// DELETE /api/pricing-rules/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM pricing_rules WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar regra de preço' });
  }
});

module.exports = router;
