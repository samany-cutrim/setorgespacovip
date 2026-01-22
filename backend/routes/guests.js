const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/guests
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM guests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar hóspedes' });
  }
});

// POST /api/guests
router.post('/', async (req, res) => {
  const { full_name, email, phone, document, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO guests (full_name, email, phone, document, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [full_name, email, phone, document, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar hóspede' });
  }
});

// DELETE /api/guests/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM guests WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar hóspede' });
  }
});

module.exports = router;
