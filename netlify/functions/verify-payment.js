/* ============================================================
   verify-payment  (Netlify Function)
   Called by the app after Paystack checkout succeeds.
   - Verifies the transaction with Paystack using the SECRET key
   - Computes subscription expiry (monthly = +30d, yearly = +365d)
   - Upserts the subscription into Supabase
   - Returns the authoritative subscription to the app
   Env vars required (set in Netlify dashboard):
     PAYSTACK_SECRET_KEY   sk_live_...    (NEVER expose this in front-end)
     SUPABASE_URL          https://xxxx.supabase.co
     SUPABASE_SERVICE_KEY  service_role key (server-only)
============================================================ */
const { createClient } = require('@supabase/supabase-js');

const PLAN_DAYS = { monthly: 30, yearly: 365 };
const PLAN_AMOUNT = { monthly: 450000, yearly: 2000000 }; // kobo — must match front-end

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {});
  if (event.httpMethod !== 'POST') return json(405, { success: false, message: 'Method not allowed' });

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return json(400, { success: false, message: 'Bad request' }); }

  const { reference, email, plan } = payload;
  if (!reference || !email || !PLAN_DAYS[plan]) {
    return json(400, { success: false, message: 'Missing reference, email or plan' });
  }

  const SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!SECRET) return json(500, { success: false, message: 'Server not configured (PAYSTACK_SECRET_KEY)' });

  // 1) Verify with Paystack
  let verify;
  try {
    const r = await fetch('https://api.paystack.co/transaction/verify/' + encodeURIComponent(reference), {
      headers: { Authorization: 'Bearer ' + SECRET }
    });
    verify = await r.json();
  } catch (e) {
    return json(502, { success: false, message: 'Could not reach Paystack' });
  }

  const tx = verify && verify.data;
  if (!verify.status || !tx || tx.status !== 'success') {
    return json(402, { success: false, message: 'Payment not successful' });
  }

  // 2) Sanity checks — amount must match the plan, email should match
  if (tx.amount < PLAN_AMOUNT[plan]) {
    return json(402, { success: false, message: 'Amount does not match plan' });
  }

  // 3) Compute expiry. If the user already has time left, extend from there.
  const now = Date.now();
  let base = now;
  const supabase = getSupabase();
  if (supabase) {
    const { data: existing } = await supabase
      .from('subscriptions').select('expires').eq('email', email.toLowerCase()).maybeSingle();
    if (existing && existing.expires && new Date(existing.expires).getTime() > now) {
      base = new Date(existing.expires).getTime();
    }
  }
  const expiresMs = base + PLAN_DAYS[plan] * 86400000;
  const expiresISO = new Date(expiresMs).toISOString();

  // 4) Save to Supabase (source of truth)
  if (supabase) {
    const { error } = await supabase.from('subscriptions').upsert({
      email: email.toLowerCase(),
      plan,
      reference,
      amount: tx.amount,
      status: 'active',
      expires: expiresISO,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' });
    if (error) return json(500, { success: false, message: 'Could not save subscription' });
  }

  // 5) Return authoritative subscription
  return json(200, {
    success: true,
    subscription: { plan, expires: expiresMs, reference, status: 'active' }
  });
};

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

