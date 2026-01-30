-- Create audiencias_trt table for TRT hearing schedule consultation
CREATE TABLE IF NOT EXISTS audiencias_trt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_advogado_parte ON audiencias_trt(advogado_parte);
CREATE INDEX IF NOT EXISTS idx_data_audiencia ON audiencias_trt(data_audiencia);
CREATE INDEX IF NOT EXISTS idx_status ON audiencias_trt(status);

-- Enable Row Level Security (RLS)
ALTER TABLE audiencias_trt ENABLE ROW LEVEL SECURITY;

-- Create policies for the table
-- Allow authenticated users to read all hearings
CREATE POLICY "Allow authenticated users to read hearings"
  ON audiencias_trt
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert hearings
CREATE POLICY "Allow authenticated users to insert hearings"
  ON audiencias_trt
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update hearings
CREATE POLICY "Allow authenticated users to update hearings"
  ON audiencias_trt
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete hearings
CREATE POLICY "Allow authenticated users to delete hearings"
  ON audiencias_trt
  FOR DELETE
  TO authenticated
  USING (true);
