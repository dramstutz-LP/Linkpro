const path = require('path');
const express = require('express');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const checkoutRouter = require('./routes/checkout');
const webhooksRouter = require('./routes/webhooks');

const app = express();
const PORT = process.env.PORT || 8080;
const rootDir = path.join(__dirname, '..');

app.use('/api/webhooks/stripe', webhooksRouter);
app.use(express.json());
app.use('/api', checkoutRouter);
app.use(express.static(rootDir));

app.listen(PORT, () => {
  const stripeReady = Boolean(
    process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_...')
  );
  console.log(`LINK Pro running at http://localhost:${PORT}`);
  console.log(stripeReady ? 'Stripe: configured' : 'Stripe: add keys in .env to enable checkout');
});
