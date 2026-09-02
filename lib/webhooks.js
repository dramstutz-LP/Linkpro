const Stripe = require('stripe');

async function processStripeWebhook(rawBody, signature) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret || webhookSecret.startsWith('whsec_...')) {
    return { error: 'Stripe webhook is not configured', status: 503 };
  }

  const stripe = new Stripe(secretKey);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { error: `Webhook Error: ${err.message}`, status: 400 };
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('Payment complete:', {
        sessionId: session.id,
        productId: session.metadata?.productId,
        customerEmail: session.customer_details?.email,
      });
      break;
    }
    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return { received: true };
}

module.exports = { processStripeWebhook };
