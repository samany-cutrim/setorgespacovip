CREATE TABLE IF NOT EXISTS property_settings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_guests INTEGER,
  amenities TEXT[],
  images TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
