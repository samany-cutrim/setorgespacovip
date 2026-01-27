const express = require('express');
const router = express.Router();
const sql = require('../../db.js');

// Get all hearings with optional filtering
router.get('/', async (req, res) => {
  try {
    const { advogado_parte, status, data_inicio, data_fim } = req.query;
    
    // Build filter conditions
    const conditions = [];
    
    if (advogado_parte) {
      conditions.push(sql`LOWER(advogado_parte) LIKE LOWER(${'%' + advogado_parte + '%'})`);
    }

    if (status) {
      conditions.push(sql`status = ${status}`);
    }

    if (data_inicio) {
      conditions.push(sql`data_audiencia >= ${data_inicio}`);
    }

    if (data_fim) {
      conditions.push(sql`data_audiencia <= ${data_fim}`);
    }

    // Combine conditions
    let query;
    if (conditions.length > 0) {
      const whereClause = conditions.reduce((acc, condition, index) => {
        if (index === 0) return condition;
        return sql`${acc} AND ${condition}`;
      });
      query = sql`SELECT * FROM audiencias_trt WHERE ${whereClause} ORDER BY data_audiencia DESC`;
    } else {
      query = sql`SELECT * FROM audiencias_trt ORDER BY data_audiencia DESC`;
    }

    const result = await query;
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
