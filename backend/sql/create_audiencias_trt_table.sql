CREATE TABLE IF NOT EXISTS audiencias_trt (
  id SERIAL PRIMARY KEY,
  numero_processo VARCHAR(255) NOT NULL,
  advogado_parte VARCHAR(255) NOT NULL,
  data_audiencia TIMESTAMP NOT NULL,
  hora_audiencia VARCHAR(10),
  tipo_audiencia VARCHAR(100),
  tribunal VARCHAR(100),
  vara VARCHAR(100),
  local VARCHAR(255),
  status VARCHAR(50) DEFAULT 'agendada',
  advogado_responsavel VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_advogado_parte ON audiencias_trt(advogado_parte);
CREATE INDEX idx_data_audiencia ON audiencias_trt(data_audiencia);
CREATE INDEX idx_status ON audiencias_trt(status);
