const Stripe = require('stripe');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith('sk_test_...')) {
    return null;
  }
  return new Stripe(key);
}

function getBaseUrl(host) {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, '');
  }
  if (host) {
    return `https://${host}`;
  }
  return `http://localhost:${process.env.PORT || 8080}`;
}

function getPublishableKey() {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey || publishableKey.startsWith('pk_test_...')) {
    return null;
  }
  return publishableKey;
}

module.exports = { getStripe, getBaseUrl, getPublishableKey };
