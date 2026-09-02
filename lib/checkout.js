const { getStripe, getBaseUrl, getPublishableKey } = require('./stripe');
const { getProduct } = require('../server/config/products');

function getStripeConfig() {
  const publishableKey = getPublishableKey();
  if (!publishableKey) {
    return { error: 'Stripe is not configured', status: 503 };
  }
  return { publishableKey };
}

async function createCheckoutSession(productId, host) {
  const stripe = getStripe();
  if (!stripe) {
    return {
      error: 'Stripe is not configured. Copy .env.example to .env and add your test keys.',
      status: 503,
    };
  }

  const product = getProduct(productId);
  if (!product) {
    return { error: 'Unknown product or missing Stripe Price ID in .env', status: 400 };
  }

  const baseUrl = getBaseUrl(host);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: product.priceId, quantity: 1 }],
    success_url: `${baseUrl}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout-cancel.html?product=${product.id}`,
    metadata: { productId: product.id },
  });

  return { url: session.url };
}

async function getCheckoutSession(sessionId) {
  const stripe = getStripe();
  if (!stripe) {
    return { error: 'Stripe is not configured', status: 503 };
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const product = getProduct(session.metadata?.productId);

  return {
    status: session.payment_status,
    productId: session.metadata?.productId,
    productName: product?.name,
    successUrl: product?.successUrl || '/courses.html',
  };
}

module.exports = { getStripeConfig, createCheckoutSession, getCheckoutSession };
