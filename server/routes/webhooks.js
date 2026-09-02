const express = require('express');
const { processStripeWebhook } = require('../../lib/webhooks');

const router = express.Router();

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const result = await processStripeWebhook(req.body, req.headers['stripe-signature']);

  if (result.error) {
    return res.status(result.status).send(result.error);
  }

  res.json({ received: true });
});

module.exports = router;
