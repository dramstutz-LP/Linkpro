const { createCheckoutSession } = require('../lib/checkout');
const { readJsonBody } = require('../lib/body');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId } = readJsonBody(req);
    const result = await createCheckoutSession(productId, req.headers.host);

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({ url: result.url });
  } catch (err) {
    console.error('Checkout session error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
