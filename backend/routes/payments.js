const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/payments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments ORDER BY payment_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pagamentos' });
  }
});

// POST /api/payments
router.post('/', async (req, res) => {
  const { reservation_id, amount, payment_date, payment_method, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO payments (reservation_id, amount, payment_date, payment_method, notes, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [reservation_id, amount, payment_date, payment_method, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
});

// DELETE /api/payments/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM payments WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar pagamento' });
  }
});

module.exports = router;
