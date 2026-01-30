import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Backend routes
import blockedDatesRouter from './backend/routes/blockedDates.js';
import guestsRouter from './backend/routes/guests.js';
import expensesRouter from './backend/routes/expenses.js';
import pricingRulesRouter from './backend/routes/pricingRules.js';
import reservationsRouter from './backend/routes/reservations.js';
import propertySettingsRouter from './backend/routes/propertySettings.js';
import paymentsRouter from './backend/routes/payments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());

// API Routes
app.use('/api/blocked-dates', blockedDatesRouter);
app.use('/api/guests', guestsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/pricing-rules', pricingRulesRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/property-settings', propertySettingsRouter);
app.use('/api/payments', paymentsRouter);

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
