# TODO

Personal task tracker for LINK Pro. Check items off as you go (`- [ ]` → `- [x]`).

See also: [`stripe-checkout.md`](stripe-checkout.md) for full setup docs and troubleshooting.

---

## Stripe setup (required to test checkout)

Everything below must be done before **Enroll Now** on `courses.html` will work.

### Account & local environment

- [ ] Create a [Stripe account](https://dashboard.stripe.com/register) (test mode is fine for now)
- [ ] Install Node.js 18+ on your machine
- [ ] Run `npm install` in the project root
- [ ] Copy `.env.example` to `.env` (`cp .env.example .env`)

### Stripe Dashboard — API keys

- [ ] Open [Stripe test API keys](https://dashboard.stripe.com/test/apikeys)
- [ ] Set `STRIPE_SECRET_KEY` in `.env` (`sk_test_...`)
- [ ] Set `STRIPE_PUBLISHABLE_KEY` in `.env` (`pk_test_...`)

### Stripe Dashboard — products & prices

Create one Product + one-time Price per offering, then copy each **Price ID** (`price_...`) into `.env`.

- [ ] **Pelvis 1.0** ($100) → `STRIPE_PRICE_PELVIS_1`
- [ ] **Lower Limb Injury Prevention** ($199) → `STRIPE_PRICE_LLIP`
- [ ] **Fascia & 2TLS — Upper Limb seminar** ($1,500) → `STRIPE_PRICE_SEMINAR`

### Server config

- [ ] Set `PORT=8080` (or your preferred port) in `.env`
- [ ] Set `BASE_URL=http://localhost:8080` in `.env` (must match where you run the server)
- [ ] Run `npm start` and confirm the console shows **Stripe: configured**
- [ ] Open http://localhost:8080/courses.html

### Verify checkout works

- [ ] Click **Enroll Now** on a course — Stripe Checkout page opens
- [ ] Pay with test card **4242 4242 4242 4242** (any future expiry, any CVC)
- [ ] Land on `checkout-success.html` with payment verified and a course link

### Webhooks (recommended before relying on post-payment logic)

Local testing:

- [ ] Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [ ] Run `stripe listen --forward-to localhost:8080/api/webhooks/stripe`
- [ ] Copy the CLI `whsec_...` secret into `STRIPE_WEBHOOK_SECRET` in `.env`
- [ ] Restart the server and complete a test checkout
- [ ] Confirm server logs `Payment complete:` for `checkout.session.completed`

Production (when deployed):

- [ ] Deploy the Node server (static-only hosting is not enough)
- [ ] Set `BASE_URL` to your live domain in production env
- [ ] Add webhook endpoint `https://your-domain.com/api/webhooks/stripe` in Stripe Dashboard
- [ ] Subscribe to `checkout.session.completed`

---

## Stripe follow-ups (after basic checkout works)

- [ ] Implement fulfillment in `server/routes/webhooks.js` (grant course access by email, token, or database)
- [ ] Gate `pelvis-1-course.html` so only purchasers can access lessons
- [ ] Add remaining products (Pelvis 3.0, other seminars, 3-seminar bundle) to `server/config/products.js` and `.env`
- [ ] Wire enroll buttons on `index.html` (still links to linkprosport.com today)
- [ ] Enable customer email collection on Checkout Sessions for reliable fulfillment
- [ ] Switch to live Stripe keys and complete Stripe account activation before accepting real payments
- [ ] Set up receipts / purchase confirmation emails

---

## My tasks

Add your own items below.

- [ ] 
- [ ] 
- [ ] 

---

## Notes

<!-- Free-form notes, links, blockers, etc. -->

