/* ============================================================
   paystack-webhook  (Netlify Function)
   Set this URL in your Paystack Dashboard:
     https://YOUR-DOMAIN/.netlify/functions/paystack-webhook
   Verifies Paystack's signature, then keeps subscriptions in sync:
     charge.success      -> extend / activate
     invoice.payment_failed / subscription.disable -> mark past_due / cancelled
   Requires env: PAYSTACK_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
============================================================ */
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const PLAN_DAYS = { monthly: 30, yearly: 365 };

exports.handler = async (event) => {
  const SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!SECRET) return { statusCode: 500, body: 'not configured' };

  // 1) Verify signature
  const signature = event.headers['x-paystack-signature'];
  const hash = crypto.createHmac('sha512', SECRET).update(event.body || '').digest('hex');
  if (hash !== signature) return { statusCode: 401, body: 'invalid signature' };

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'bad body' }; }

  const supabase = getSupabase();
  if (!supabase) return { statusCode: 200, body: 'ok (no db)' };

  const ev = body.event;
  const data = body.data || {};
  const email = (data.customer && data.customer.email || '').toLowerCase();

  try {
    if (ev === 'charge.success' && email) {
      // recurring (or first) successful charge — extend from current expiry
      const plan = guessPlan(data);
      const days = PLAN_DAYS[plan] || 30;
      const { data: existing } = await supabase
        .from('subscriptions').select('expires').eq('email', email).maybeSingle();
      const now = Date.now();
      let base = now;
      if (existing && existing.expires && new Date(existing.expires).getTime() > now) {
        base = new Date(existing.expires).getTime();
      }
      await supabase.from('subscriptions').upsert({
        email, plan, status: 'active',
        reference: data.reference || null,
        expires: new Date(base + days * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });
    }

    if ((ev === 'invoice.payment_failed' || ev === 'invoice.update') && email) {
      await supabase.from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('email', email);
    }

    if ((ev === 'subscription.disable' || ev === 'subscription.not_renew') && email) {
      await supabase.from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('email', email);
    }
  } catch (e) {
    return { statusCode: 500, body: 'error' };
  }

  return { statusCode: 200, body: 'ok' };
};

function guessPlan(data) {
  const amt = data.amount || (data.plan && data.plan.amount) || 0;
  if (amt >= 2000000) return 'yearly';
  return 'monthly';
}
function getSupabase() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

