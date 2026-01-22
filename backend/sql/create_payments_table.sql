CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER,
  amount NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
