const express = require('express');
const Stripe = require('stripe');

const router = express.Router();

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret || webhookSecret.startsWith('whsec_...')) {
    return res.status(503).send('Stripe webhook is not configured');
  }

  const stripe = new Stripe(secretKey);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('Payment complete:', {
        sessionId: session.id,
        productId: session.metadata?.productId,
        customerEmail: session.customer_details?.email,
      });
      // TODO: grant course access (email, database, or access token)
      break;
    }
    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
