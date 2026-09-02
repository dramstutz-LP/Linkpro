async function startCheckout(productId, button) {
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Loading…';
  button.classList.add('is-loading');

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Could not start checkout');
    }

    window.location.href = data.url;
  } catch (error) {
    alert(error.message || 'Checkout failed. Please try again.');
    button.disabled = false;
    button.textContent = originalText;
    button.classList.remove('is-loading');
  }
}

document.addEventListener('click', function (event) {
  const button = event.target.closest('[data-stripe-product]');
  if (!button) return;

  event.preventDefault();
  startCheckout(button.dataset.stripeProduct, button);
});
