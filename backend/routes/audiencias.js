const express = require('express');
const router = express.Router();
const sql = require('../../db.js');

// Get all hearings with optional filtering
router.get('/', async (req, res) => {
  try {
    const { advogado_parte, status, data_inicio, data_fim } = req.query;
    
    let query = 'SELECT * FROM audiencias_trt WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (advogado_parte) {
      query += ` AND LOWER(advogado_parte) LIKE LOWER($${paramCount})`;
      params.push(`%${advogado_parte}%`);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (data_inicio) {
      query += ` AND data_audiencia >= $${paramCount}`;
      params.push(data_inicio);
      paramCount++;
    }

    if (data_fim) {
      query += ` AND data_audiencia <= $${paramCount}`;
      params.push(data_fim);
      paramCount++;
    }

    query += ' ORDER BY data_audiencia DESC';

    const result = await sql.unsafe(query, params);
    res.json(result);
  } catch (error) {
    console.error('Error fetching hearings:', error);
    res.status(500).json({ error: 'Failed to fetch hearings' });
  }
});

// Get a single hearing by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
      SELECT * FROM audiencias_trt WHERE id = ${id}
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Hearing not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching hearing:', error);
    res.status(500).json({ error: 'Failed to fetch hearing' });
  }
});

// Create a new hearing
router.post('/', async (req, res) => {
  try {
    const {
      numero_processo,
      advogado_parte,
      data_audiencia,
      hora_audiencia,
      tipo_audiencia,
      tribunal,
      vara,
      local,
      status,
      advogado_responsavel,
      observacoes
    } = req.body;

    const result = await sql`
      INSERT INTO audiencias_trt (
        numero_processo,
        advogado_parte,
        data_audiencia,
        hora_audiencia,
        tipo_audiencia,
        tribunal,
        vara,
        local,
        status,
        advogado_responsavel,
        observacoes
      ) VALUES (
        ${numero_processo},
        ${advogado_parte},
        ${data_audiencia},
        ${hora_audiencia || null},
        ${tipo_audiencia || null},
        ${tribunal || null},
        ${vara || null},
        ${local || null},
        ${status || 'agendada'},
        ${advogado_responsavel || null},
        ${observacoes || null}
      )
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating hearing:', error);
    res.status(500).json({ error: 'Failed to create hearing' });
  }
});

// Update a hearing
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numero_processo,
      advogado_parte,
      data_audiencia,
      hora_audiencia,
      tipo_audiencia,
      tribunal,
      vara,
      local,
      status,
      advogado_responsavel,
      observacoes
    } = req.body;

    const result = await sql`
      UPDATE audiencias_trt
      SET
        numero_processo = ${numero_processo},
        advogado_parte = ${advogado_parte},
        data_audiencia = ${data_audiencia},
        hora_audiencia = ${hora_audiencia},
        tipo_audiencia = ${tipo_audiencia},
        tribunal = ${tribunal},
        vara = ${vara},
        local = ${local},
        status = ${status},
        advogado_responsavel = ${advogado_responsavel},
        observacoes = ${observacoes},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Hearing not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error updating hearing:', error);
    res.status(500).json({ error: 'Failed to update hearing' });
  }
});

// Delete a hearing
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
      DELETE FROM audiencias_trt WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Hearing not found' });
    }

    res.json({ message: 'Hearing deleted successfully' });
  } catch (error) {
    console.error('Error deleting hearing:', error);
    res.status(500).json({ error: 'Failed to delete hearing' });
  }
});

module.exports = router;
