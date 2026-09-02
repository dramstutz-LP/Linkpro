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

Production (when deployed on Vercel):

- [ ] Complete the **Vercel deployment** checklist below
- [ ] Add webhook endpoint `https://your-domain.com/api/webhooks/stripe` in Stripe Dashboard
- [ ] Subscribe to `checkout.session.completed`
- [ ] Copy the webhook signing secret into Vercel as `STRIPE_WEBHOOK_SECRET` and redeploy

---

## Vercel deployment

Merge [`cursor/vercel-setup-fb18`](https://github.com/dramstutz-LP/Linkpro/pull/4) (or ensure `api/` routes and `vercel.json` are on your deploy branch) before deploying.

### Connect the project

- [ ] Go to [vercel.com/new](https://vercel.com/new) and import `dramstutz-LP/Linkpro`
- [ ] Framework preset: **Other** (no build command needed)
- [ ] Leave **Build Command** and **Output Directory** empty
- [ ] Set production branch to `stripe-test` (or `main` after merge)
- [ ] Deploy once to get a preview URL (e.g. `https://linkpro-xxx.vercel.app`)

### Environment variables

In Vercel → Project → **Settings → Environment Variables**, add:

- [ ] `BASE_URL` → your production URL (e.g. `https://linkpro.com` or your `.vercel.app` URL for testing)
- [ ] `STRIPE_SECRET_KEY` → `sk_test_...` for preview, `sk_live_...` for production
- [ ] `STRIPE_PUBLISHABLE_KEY` → `pk_test_...` or `pk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET` → add after creating the webhook endpoint (see below)
- [ ] `STRIPE_PRICE_PELVIS_1` → Stripe Price ID
- [ ] `STRIPE_PRICE_LLIP` → Stripe Price ID
- [ ] `STRIPE_PRICE_SEMINAR` → Stripe Price ID

Apply to **Production** (and **Preview** if you want checkout on preview deploys).

### Stripe webhook (production)

- [ ] Stripe Dashboard → **Developers → Webhooks → Add endpoint**
- [ ] URL: `https://your-domain.com/api/webhooks/stripe`
- [ ] Event: `checkout.session.completed`
- [ ] Copy the signing secret (`whsec_...`) into Vercel as `STRIPE_WEBHOOK_SECRET`
- [ ] Redeploy so the new env var is picked up
- [ ] Complete a test checkout and confirm Vercel function logs show `Payment complete:`

### Custom domain (optional)

- [ ] Vercel → Project → **Domains** → add your domain
- [ ] Update DNS with the records Vercel provides
- [ ] Update `BASE_URL` in Vercel to match the custom domain
- [ ] Update the Stripe webhook URL to use the custom domain
- [ ] Redeploy

### Verify production checkout

- [ ] Open `https://your-domain.com/courses.html`
- [ ] Click **Enroll Now** — Stripe Checkout opens
- [ ] Complete payment (test card in test mode, real card only with live keys)
- [ ] Land on `checkout-success.html` with payment verified

### Go live

- [ ] Switch Stripe env vars in Vercel from test keys to live keys
- [ ] Create a separate Stripe webhook endpoint for live mode (or update existing)
- [ ] Confirm Stripe account activation is complete before accepting real payments


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

