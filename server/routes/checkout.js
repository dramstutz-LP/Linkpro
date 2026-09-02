const express = require('express');
const Stripe = require('stripe');
const { getProduct } = require('../config/products');

const router = express.Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith('sk_test_...')) {
    return null;
  }
  return new Stripe(key);
}

function getBaseUrl() {
  return process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`;
}

router.get('/stripe-config', (_req, res) => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey || publishableKey.startsWith('pk_test_...')) {
    return res.status(503).json({ error: 'Stripe is not configured' });
  }
  res.json({ publishableKey });
});

router.post('/create-checkout-session', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured. Copy .env.example to .env and add your test keys.' });
  }

  const { productId } = req.body;
  const product = getProduct(productId);
  if (!product) {
    return res.status(400).json({ error: 'Unknown product or missing Stripe Price ID in .env' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: product.priceId, quantity: 1 }],
      success_url: `${getBaseUrl()}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}/checkout-cancel.html?product=${product.id}`,
      metadata: { productId: product.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/checkout-session/:sessionId', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const product = getProduct(session.metadata?.productId);

    res.json({
      status: session.payment_status,
      productId: session.metadata?.productId,
      productName: product?.name,
      successUrl: product?.successUrl || '/courses.html',
    });
  } catch (err) {
    console.error('Session lookup error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
