const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY expense_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar despesas' });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  const { description, amount, expense_date, category } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO expenses (description, amount, expense_date, category, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [description, amount, expense_date, category]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar despesa' });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar despesa' });
  }
});

module.exports = router;
