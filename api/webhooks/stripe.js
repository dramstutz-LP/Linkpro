const { processStripeWebhook } = require('../../lib/webhooks');
const { readRawBody } = require('../../lib/body');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const rawBody = await readRawBody(req);
    const result = await processStripeWebhook(rawBody, req.headers['stripe-signature']);

    if (result.error) {
      return res.status(result.status).send(result.error);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(500).send('Webhook handler failed');
  }
};
