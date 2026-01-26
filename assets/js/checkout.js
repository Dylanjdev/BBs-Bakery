/* Shared Stripe Checkout helper for BB's Bakery & Cafe */
(() => {
  const endpoint = window.CHECKOUT_ENDPOINT || '/api/create-checkout-session';
  const publishableKey = window.STRIPE_PUBLISHABLE_KEY || '';
  let stripeInstance;

  const getStripe = () => {
    if (stripeInstance) return stripeInstance;
    if (!publishableKey) {
      throw new Error('Stripe publishable key is not set.');
    }
    stripeInstance = Stripe(publishableKey);
    return stripeInstance;
  };

  const setStatus = (message, type = 'info') => {
    const el = document.querySelector('[data-checkout-message]');
    if (!el) return;
    el.textContent = message;
    el.className = `checkout-message ${type}`;
  };

  async function startCheckout(priceId, quantity = 1) {
    if (!priceId) {
      setStatus('Please select an item first.', 'error');
      return;
    }

    setStatus('Redirecting to secure checkout…', 'info');

    const payload = { priceId, quantity: Number(quantity) || 1 };

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error(err);
      setStatus('Network error starting checkout. Please try again.', 'error');
      return;
    }

    if (!response.ok) {
      setStatus('Unable to start checkout. Please call to order.', 'error');
      return;
    }

    const data = await response.json();
    if (!data.id) {
      setStatus('Checkout session missing. Please call to order.', 'error');
      return;
    }

    try {
      const stripe = getStripe();
      const { error } = await stripe.redirectToCheckout({ sessionId: data.id });
      if (error) {
        console.error(error);
        setStatus(error.message || 'Checkout failed. Please call to order.', 'error');
      }
    } catch (err) {
      console.error(err);
      setStatus('Unable to load payment. Please call to order.', 'error');
    }
  }

  const wireCheckoutButtons = () => {
    const buttons = document.querySelectorAll('.checkout-button');
    buttons.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const priceId = btn.dataset.priceId;
        const quantity = btn.dataset.qty || 1;
        btn.disabled = true;
        btn.classList.add('loading');
        try {
          await startCheckout(priceId, quantity);
        } finally {
          btn.disabled = false;
          btn.classList.remove('loading');
        }
      });
    });
  };

  document.addEventListener('DOMContentLoaded', wireCheckoutButtons);

  window.startCheckout = startCheckout;
})();
