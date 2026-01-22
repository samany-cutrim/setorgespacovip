CREATE TABLE IF NOT EXISTS blocked_dates (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
