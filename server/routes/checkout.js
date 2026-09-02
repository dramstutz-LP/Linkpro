const express = require('express');
const { getStripeConfig, createCheckoutSession, getCheckoutSession } = require('../../lib/checkout');
const { processStripeWebhook } = require('../../lib/webhooks');

const router = express.Router();

router.get('/stripe-config', (_req, res) => {
  const result = getStripeConfig();
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  res.json({ publishableKey: result.publishableKey });
});

router.post('/create-checkout-session', async (req, res) => {
  try {
    const result = await createCheckoutSession(req.body.productId, req.headers.host);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    res.json({ url: result.url });
  } catch (err) {
    console.error('Checkout session error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/checkout-session/:sessionId', async (req, res) => {
  try {
    const result = await getCheckoutSession(req.params.sessionId);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error('Session lookup error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
