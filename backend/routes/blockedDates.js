const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/blocked-dates
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blocked_dates ORDER BY start_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar datas bloqueadas' });
  }
});

// POST /api/blocked-dates
router.post('/', async (req, res) => {
  const { start_date, end_date, reason } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO blocked_dates (start_date, end_date, reason, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [start_date, end_date, reason]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar data bloqueada' });
  }
});

// DELETE /api/blocked-dates/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM blocked_dates WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar data bloqueada' });
  }
});

module.exports = router;
