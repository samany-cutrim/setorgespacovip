CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_guests INTEGER NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2),
  deposit_amount NUMERIC(12,2),
  status VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  notes TEXT,
  contract_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
