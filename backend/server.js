const express = require('express');
const app = express();
const blockedDatesRouter = require('./routes/blockedDates');
const guestsRouter = require('./routes/guests');
const expensesRouter = require('./routes/expenses');
const pricingRulesRouter = require('./routes/pricingRules');
const reservationsRouter = require('./routes/reservations');
const propertySettingsRouter = require('./routes/propertySettings');
const paymentsRouter = require('./routes/payments');

app.use(express.json());
app.use('/api/blocked-dates', blockedDatesRouter);
app.use('/api/guests', guestsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/pricing-rules', pricingRulesRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/property-settings', propertySettingsRouter);
app.use('/api/payments', paymentsRouter);

// ...outras rotas e configurações

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
