const products = {
  'pelvis-1': {
    id: 'pelvis-1',
    name: 'Pelvis 1.0',
    priceId: process.env.STRIPE_PRICE_PELVIS_1,
    successUrl: '/pelvis-1-course.html',
  },
  llip: {
    id: 'llip',
    name: 'Lower Limb Injury Prevention',
    priceId: process.env.STRIPE_PRICE_LLIP,
    successUrl: '/courses.html#online',
  },
  'seminar-upper-limb': {
    id: 'seminar-upper-limb',
    name: 'Fascia & 2TLS — Upper Limb',
    priceId: process.env.STRIPE_PRICE_SEMINAR,
    successUrl: '/courses.html#seminars',
  },
};

function getProduct(id) {
  const product = products[id];
  if (!product || !product.priceId || product.priceId.startsWith('price_...')) {
    return null;
  }
  return product;
}

module.exports = { products, getProduct };
