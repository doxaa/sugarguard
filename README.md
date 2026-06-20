# SugarGuard — Setup & Deployment Guide

A premium mobile-first PWA for tracking estimated food sugar impact, hydration,
sleep, exercise, and AI coaching — with real Paystack subscriptions enforced on
a server (Netlify Functions + Supabase).

You will deploy in **5 steps**. Total time: ~20–30 minutes. No coding required —
you only paste keys into the right places.

---

## What's in this folder

```
index.html              The app (loads the files below)
css/styles.css          All styling
js/app-core.js          App logic
js/config.js            ← YOU EDIT THIS (Paystack public key)
manifest.json           PWA install info
sw.js                   Offline support / installable PWA
icon-192.png            App icons
icon-512.png
netlify.toml            Netlify settings (leave as-is)
package.json            Function dependencies (leave as-is)
supabase-schema.sql     Database table to create (Step 2)
netlify/functions/
   verify-payment.js     Confirms each payment with Paystack (server-side)
   subscription-status.js Re-checks premium on every app load
   paystack-webhook.js    Handles auto-renewals & failed payments
```

---

## STEP 1 — Create a free Supabase project (your subscription database)

1. Go to https://supabase.com and sign up (free).
2. Click **New project**. Give it a name (e.g. "sugarguard"), set a database
   password, pick a region close to Nigeria (e.g. EU West), and create it.
3. Wait ~2 minutes for it to finish provisioning.

You'll grab the keys in Step 4.

---

## STEP 2 — Create the subscriptions table

1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file `supabase-schema.sql` from this folder, copy everything,
   paste it into the editor, and click **Run**.
3. You should see "Success". Under **Table Editor** you'll now see a
   `subscriptions` table.

> Security note: the table has Row Level Security ON with no public policies,
> so the browser can never read or write it. Only your server functions can,
> using the secret service key. This is what makes subscriptions un-fakeable.

---

## STEP 3 — Put your Paystack PUBLIC key in the app

1. Open `js/config.js`.
2. Replace the placeholder with your Paystack **public** key (starts with
   `pk_live_` for real payments, or `pk_test_` while testing):

```js
PAYSTACK_PUBLIC_KEY: "pk_live_xxxxxxxxxxxxxxxxxxxxxxxx",
```

3. Leave `API_BASE` as `"/.netlify/functions"`. Save the file.

> The public key is meant to be visible in the browser — that's fine.
> Your SECRET key never goes in any file here; it goes into Netlify (Step 5).

---

## STEP 4 — Get your keys (you'll paste them into Netlify in Step 5)

**From Paystack** (https://dashboard.paystack.com → Settings → API Keys & Webhooks):
- `Secret Key` → `sk_live_...` (keep private!)

**From Supabase** (Project Settings → API):
- `Project URL` → e.g. `https://abcd1234.supabase.co`
- `service_role` secret key (under "Project API keys" — click reveal). **Not**
  the `anon` key. Keep this private.

Keep these three values handy for the next step.

---

## STEP 5 — Deploy to Netlify

### A. Upload the site
Easiest way (no Git needed):
1. Log in at https://app.netlify.com → **Add new site → Deploy manually**.
2. Drag this **entire folder** onto the upload area.
3. Netlify builds it and gives you a temporary URL like
   `https://random-name.netlify.app`.

(If you prefer Git: push this folder to a GitHub repo and "Import from Git" —
Netlify reads `netlify.toml` automatically.)

### B. Add your secret environment variables
In Netlify: **Site configuration → Environment variables → Add a variable**.
Add these three (exact names):

| Key                    | Value                                   |
|------------------------|-----------------------------------------|
| `PAYSTACK_SECRET_KEY`  | your `sk_live_...` from Paystack         |
| `SUPABASE_URL`         | your Supabase Project URL                |
| `SUPABASE_SERVICE_KEY` | your Supabase `service_role` secret key  |

Then **redeploy** (Deploys → Trigger deploy → Deploy site) so the functions
pick up the variables.

### C. Connect your custom domain
**Domain management → Add a domain** → enter your domain and follow the DNS
instructions. Netlify gives you free HTTPS automatically.

### D. Set the Paystack webhook
In Paystack Dashboard → **Settings → API Keys & Webhooks → Webhook URL**, enter:

```
https://YOUR-DOMAIN/.netlify/functions/paystack-webhook
```

Save. This lets Paystack tell your app about renewals and failed payments.

---

## Test it

1. Temporarily put your **test** keys in (pk_test in config.js, sk_test in
   Netlify) and use a Paystack test card to subscribe.
2. After paying, the app should show "You're Premium!" with an expiry date,
   and a row should appear in your Supabase `subscriptions` table.
3. Switch to live keys when you're happy.

---

## How the subscription works (plain English)

- A user pays through Paystack inside the app.
- `verify-payment` confirms the payment **on the server** with your secret key,
  then writes their email + expiry date to Supabase.
- Every time the app opens, `subscription-status` re-checks Supabase. So:
  - A user **cannot** unlock premium by editing their browser — the server
    decides.
  - When the date passes, the app automatically drops them back to the **Free**
    plan (3 meal checks/day) and shows a renew prompt.
- The app reminds the user **3 days before** renewal, shows a short **grace**
  period if a renewal charge is retrying, and `paystack-webhook` keeps
  everything in sync when Paystack charges them again.

---

## Pricing (already set in the app)

- **Free:** 3 meal checks/day, basic water tracker & GL estimate
- **Premium Monthly:** ₦4,500
- **Premium Yearly:** ₦20,000

To change prices later, edit **both**:
- `js/app-core.js` → the `PLANS` object (price text + `amount` in kobo)
- `netlify/functions/verify-payment.js` → `PLAN_AMOUNT` (must match)

---

## Important: this is a wellness tool, not a medical device

SugarGuard shows **estimates** from food data. It does not measure blood glucose
and does not diagnose anything. The disclaimer is built into the app. Keep it.

---

## Need help?

If a payment shows "couldn't confirm," check:
1. The three Netlify environment variables are spelled exactly right.
2. You redeployed after adding them.
3. The amount in `verify-payment.js` matches `js/app-core.js`.
4. Your Supabase table exists and the service_role key is correct.
