/* ============================================================
   SugarGuard — front-end configuration
   Edit ONLY this file to connect your accounts.
   This file is safe to be public: it contains the PUBLIC key only.
   Your Paystack SECRET key lives on the server (Netlify env vars).
============================================================ */
window.CONFIG = {
  // 1) Paste your Paystack PUBLIC key here (starts with pk_live_ or pk_test_)
  PAYSTACK_PUBLIC_KEY: "pk_live_84864b7a3c351a69dce1f1c22a1a726b393aa222",

  // 2) Where the Netlify Functions live. Leave as-is for Netlify.
  //    (On Netlify, functions are served from /.netlify/functions)
  API_BASE: "/.netlify/functions"
};

