
/* ============================================================
   subscription-status  (Netlify Function)
   GET /.netlify/functions/subscription-status?email=you@email.com
   Returns the authoritative subscription for an email so the app
   can enforce premium/cutoff even if local storage was edited.
============================================================ */
const { createClient } = require('@supabase/supabase-js');

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {});
  const email = (event.queryStringParameters && event.queryStringParameters.email || '').toLowerCase().trim();
  if (!email) return json(400, { found: false, message: 'email required' });

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return json(200, { found: false }); // not configured yet

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from('subscriptions').select('plan, expires, reference, status')
    .eq('email', email).maybeSingle();

  if (error || !data) return json(200, { found: false });

  return json(200, {
    found: true,
    plan: data.plan,
    reference: data.reference,
    status: data.status,
    expires: data.expires ? new Date(data.expires).getTime() : null
  });
};
