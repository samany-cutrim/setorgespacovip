const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/reservations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar reservas' });
  }
});

// POST /api/reservations
router.post('/', async (req, res) => {
  const { guest_id, check_in, check_out, num_guests, total_amount, discount_amount, deposit_amount, status, payment_status, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reservations (guest_id, check_in, check_out, num_guests, total_amount, discount_amount, deposit_amount, status, payment_status, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *',
      [guest_id, check_in, check_out, num_guests, total_amount, discount_amount, deposit_amount, status, payment_status, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
});

// DELETE /api/reservations/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar reserva' });
  }
});

module.exports = router;
