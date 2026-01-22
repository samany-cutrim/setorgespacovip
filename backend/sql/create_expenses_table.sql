CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
