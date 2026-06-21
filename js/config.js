/* ============================================================
   SugarGuard — front-end configuration
   Edit ONLY this file to connect your accounts.
   This file is safe to be public: it contains the PUBLIC key only.
   Your Paystack SECRET key lives on the server (Netlify env vars).
============================================================ */
window.CONFIG = {
  // 1) Paste your Paystack PUBLIC key here (starts with pk_live_ or pk_test_)
  PAYSTACK_PUBLIC_KEY:"sk_live_6f54f64982cb7146b12c53bd7b4364248bd83854",

  // 2) Where the Netlify Functions live. Leave as-is for Netlify.
  //    (On Netlify, functions are served from /.netlify/functions)
  API_BASE: "/.netlify/functions"
};

