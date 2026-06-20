/* ============================================================
   SugarGuard — front-end configuration
   Edit ONLY this file to connect your accounts.
   This file is safe to be public: it contains the PUBLIC key only.
   Your Paystack SECRET key lives on the server (Netlify env vars).
============================================================ */
window.CONFIG = {
  // 1) Paste your Paystack PUBLIC key here (starts with pk_live_ or pk_test_)
  PAYSTACK_PUBLIC_KEY: "sk_live_73501c2cdb7006a7e114f6f8fa3043132b31c01c",

  // 2) Where the Netlify Functions live. Leave as-is for Netlify.
  //    (On Netlify, functions are served from /.netlify/functions)
  API_BASE: "/.netlify/functions"
};

