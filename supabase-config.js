/* ============================================================
   Timeout Restaurant — Supabase configuration (single source)
   ------------------------------------------------------------
   Change the project or rotate the key here, once, and every
   page (index / ex / admin / orders) follows.

   `anonKey` is the *publishable* (anon) key — it is designed to
   be public and is protected by Row Level Security in
   supabase/schema.sql. Never put the service_role / secret key
   in this file.
   ============================================================ */
window.TIMEOUT_SB = {
  url:        'https://nflqeygxiavqbajmykua.supabase.co',
  anonKey:    '',                       /* ← publishable key, filled after the project is restored */
  adminEmail: 'admin@timeout.com.ng',
  tables: {
    prices:       'menu_prices',
    availability: 'menu_availability',
    siteState:    'site_state',
    orders:       'orders'
  }
};

/* Creates the shared client exactly once.
   Returns null (and logs a hint) when the project is not configured,
   so pages fall back to their built-in defaults instead of throwing. */
window.__sb = (function () {
  var cfg = window.TIMEOUT_SB;
  var key = cfg && cfg.anonKey ? String(cfg.anonKey) : '';
  var ready = !!(cfg && cfg.url && key && key.indexOf('PASTE') === -1 && window.supabase);

  if (!ready) {
    console.warn('[Timeout] Supabase is not configured yet — using built-in defaults.');
    return null;
  }
  try {
    return window.supabase.createClient(cfg.url, key, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  } catch (err) {
    console.warn('[Timeout] Supabase failed to initialise:', err && err.message);
    return null;
  }
})();
