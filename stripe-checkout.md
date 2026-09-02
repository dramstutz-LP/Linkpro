# Stripe Checkout — LINK Pro

Payment handling for LINK Pro courses and seminars using [Stripe Checkout](https://stripe.com/docs/payments/checkout). This branch adds a small Node/Express backend on top of the existing static HTML site.

**Branch:** `stripe-test`

---

## Overview

The site previously linked out to `linkprosport.com` for enrollment. This scaffold keeps the marketing pages static while adding:

- Server-side Checkout Session creation (secret key never exposed to the browser)
- Redirect to Stripe-hosted checkout
- Success/cancel pages after payment
- Webhook endpoint for post-payment fulfillment

Paid enroll buttons on `courses.html` currently wired:

| Product | Price | `data-stripe-product` | Post-purchase redirect |
|---------|-------|------------------------|-------------------------|
| Pelvis 1.0 | $100 | `pelvis-1` | `/pelvis-1-course.html` |
| Lower Limb Injury Prevention | $199 | `llip` | `/courses.html#online` |
| Fascia & 2TLS — Upper Limb (seminar) | $1,500 | `seminar-upper-limb` | `/courses.html#seminars` |

Pelvis 1.0 still has a **Preview test course** link to the free local test page.

---

## Project layout

```
server/
  index.js                 # Express app — static files + API routes
  config/products.js       # Product catalog ↔ Stripe Price IDs
  routes/checkout.js       # Create session, verify session, publishable key
  routes/webhooks.js       # Stripe webhook handler
js/stripe-checkout.js      # Client: enroll button → Checkout redirect
checkout-success.html      # Verifies payment, links to course
checkout-cancel.html       # Shown when user abandons checkout
.env.example               # Template for required env vars
```

---

## Get it running

### Prerequisites

- Node.js 18+
- A [Stripe account](https://dashboard.stripe.com/register) (test mode is fine)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable | Description |
|----------|-------------|
| `PORT` | Local server port (default `8080`) |
| `BASE_URL` | Public URL of the site (use `http://localhost:8080` locally) |
| `STRIPE_SECRET_KEY` | Secret key from [API keys](https://dashboard.stripe.com/test/apikeys) |
| `STRIPE_PUBLISHABLE_KEY` | Publishable key (reserved for future client-side use) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from webhook setup (see step 4) |
| `STRIPE_PRICE_PELVIS_1` | Stripe Price ID for Pelvis 1.0 |
| `STRIPE_PRICE_LLIP` | Stripe Price ID for LLIP |
| `STRIPE_PRICE_SEMINAR` | Stripe Price ID for Upper Limb seminar |

**Create Prices in Stripe:** Dashboard → Products → Add product → set one-time price → copy the Price ID (`price_...`).

### 3. Start the server

```bash
npm start
```

Or with auto-reload during development:

```bash
npm run dev
```

Open http://localhost:8080/courses.html

On startup you should see either `Stripe: configured` or `Stripe: add keys in .env to enable checkout`.

### 4. Test a checkout

1. Click **Enroll Now** on a course card.
2. Complete payment on Stripe Checkout using test card **4242 4242 4242 4242**, any future expiry, any CVC, any billing ZIP.
3. You should land on `checkout-success.html`, which verifies the session and shows a link to the course.

### 5. Test webhooks locally (optional)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli), then:

```bash
stripe listen --forward-to localhost:8080/api/webhooks/stripe
```

Copy the `whsec_...` signing secret from the CLI output into `STRIPE_WEBHOOK_SECRET` in `.env`, restart the server, and run a test checkout. The server logs `Payment complete:` when `checkout.session.completed` is received.

For a deployed environment, add a webhook endpoint in the Stripe Dashboard pointing to:

```
https://your-domain.com/api/webhooks/stripe
```

Subscribe to `checkout.session.completed` (and any other events you need later).

---

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/create-checkout-session` | Body: `{ "productId": "pelvis-1" }` → `{ "url": "https://checkout.stripe.com/..." }` |
| `GET` | `/api/checkout-session/:sessionId` | Verify payment status after redirect |
| `GET` | `/api/stripe-config` | Returns publishable key (for future Stripe.js use) |
| `POST` | `/api/webhooks/stripe` | Stripe webhook receiver (raw body, signature verified) |

---

## Checkout flow

```
courses.html (Enroll button)
    → js/stripe-checkout.js
    → POST /api/create-checkout-session
    → redirect to Stripe Checkout
    → payment success
    → checkout-success.html?session_id=...
    → GET /api/checkout-session/:id
    → link to course (successUrl from products.js)

Parallel: Stripe → POST /api/webhooks/stripe → checkout.session.completed
```

---

## Next steps

These are the main follow-ups before taking payments in production:

1. **Fulfillment in the webhook** — In `server/routes/webhooks.js`, replace the `TODO` with real logic: store purchase by email, issue an access token, or unlock course content.

2. **Gate course access** — `pelvis-1-course.html` is currently open to everyone. After fulfillment exists, require a verified purchase (session lookup, signed cookie, or login) before showing lessons.

3. **Add remaining products** — Pelvis 3.0, other seminars, and the 3-seminar bundle need entries in `server/config/products.js`, matching Price IDs in `.env`, and enroll buttons on the relevant pages.

4. **Collect customer email in Checkout** — Consider `customer_email` or enabling email collection on the Checkout Session so fulfillment has a reliable contact.

5. **Production deployment** — Deploy the Node server (not plain static hosting alone). Set `BASE_URL` to the live domain, use live Stripe keys, and register the production webhook URL in Stripe.

6. **Receipts and support** — Enable Stripe customer emails, or send your own confirmation with course access instructions.

7. **Homepage CTAs** — `index.html` still links to `linkprosport.com` for some courses; align those with the same Stripe flow when ready.

---

## Adding a new product

1. Create a Product + Price in the Stripe Dashboard.
2. Add an env var in `.env` (and `.env.example`), e.g. `STRIPE_PRICE_PELVIS_3=price_...`.
3. Register it in `server/config/products.js` with `id`, `name`, `priceId`, and `successUrl`.
4. Add a button on the relevant HTML page:

```html
<button type="button" class="course-cta" data-stripe-product="your-product-id">
  Enroll Now
</button>
```

Ensure the page includes `<script src="js/stripe-checkout.js"></script>`.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Alert: “Stripe is not configured” | Missing or placeholder values in `.env` |
| “Unknown product or missing Stripe Price ID” | Product not in `products.js` or `STRIPE_PRICE_*` not set |
| Webhook 400 signature error | Wrong `STRIPE_WEBHOOK_SECRET`, or body parsed as JSON before webhook route |
| Checkout works but no webhook log | CLI listener not running, or Dashboard webhook URL misconfigured |
| Success page says payment not verified | Test mode keys mismatch, or session ID missing from URL |

---

## Security notes

- Never commit `.env` or live secret keys (`.gitignore` excludes `.env`).
- Use **test keys** (`sk_test_...`, `pk_test_...`) until you are ready for live payments.
- Webhook signatures must be verified (already implemented in `webhooks.js`).
- Checkout Session creation stays server-side; the browser only receives the redirect URL.

---

## Related links

- [Stripe Checkout docs](https://stripe.com/docs/payments/checkout)
- [Stripe test cards](https://stripe.com/docs/testing#cards)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- PR: https://github.com/dramstutz-LP/Linkpro/pull/3
