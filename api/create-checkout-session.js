const Stripe = require('stripe');

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.SITE_URL || 'https://www.bbs-bakery.com';
const successUrl = `${siteUrl}/checkout-success.html`;
const cancelUrl = `${siteUrl}/checkout-cancelled.html`;

const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

const respond = (status, body) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

const getMethod = (reqOrEvent) => (reqOrEvent.method || reqOrEvent.httpMethod || '').toUpperCase();

const getBody = (reqOrEvent) => {
  if (!reqOrEvent) return {};
  const raw = reqOrEvent.body;
  if (!raw) return reqOrEvent.body || {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch (err) {
      return {};
    }
  }
  return raw;
};

exports.handler = async function handler(event, context) {
  const method = getMethod(event);
  if (method !== 'POST') {
    return respond(405, { error: 'Method not allowed' });
  }

  if (!stripe) {
    return respond(500, { error: 'Missing STRIPE_SECRET_KEY' });
  }

  const body = getBody(event);
  const priceId = body.priceId;
  const quantity = Number(body.quantity || 1) || 1;

  if (!priceId) {
    return respond(400, { error: 'priceId is required' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true }
    });

    return respond(200, { id: session.id });
  } catch (err) {
    console.error('Stripe checkout error', err);
    return respond(500, { error: err.message || 'Unable to create checkout session' });
  }
};
