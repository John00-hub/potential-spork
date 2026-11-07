# Supabase setup — Timeout Restaurant

The site no longer uses Firebase. Everything now runs on Supabase:

| Feature | Old (Firebase) | New (Supabase) |
|---|---|---|
| Menu prices | `menu_prices/<id>` | `public.menu_prices` |
| Disable / out-of-stock | `menu_availability/<id>` | `public.menu_availability` |
| Pause ordering | `site_state` | `public.site_state` |
| Orders | `orders/<push-id>` | `public.orders` |
| Admin login | password inside `admin.html` | Supabase Auth (same e-mail + password) |

Project: **timeout-admin** — `nflqeygxiavqbajmykua` (eu-west-3)
URL: `https://nflqeygxiavqbajmykua.supabase.co`

## Remaining setup (3 steps)

1. **Restore the project if it is paused**
   Dashboard → project `timeout-admin` → *Restore project*.
   Every API call fails with “Database is possibly not accessible” until it is active.

2. **Create the schema**
   Run [`supabase/schema.sql`](./schema.sql) in the SQL editor (or `supabase db push`).
   It creates the four tables, Row Level Security policies, the realtime
   publication and seeds the two Jollof + Chicken prices.

3. **Create the admin user, then paste the key**
   - Authentication → Users → *Add user*: `admin@timeout.com.ng`, password
     `Timeout@2026`, **auto-confirm** on. (Or insert it with SQL — the address
     must match, because `public.is_admin()` checks the JWT e-mail.)
   - Project Settings → API → copy the **publishable / anon** key into
     `supabase-config.js` → `anonKey`.
   - Never put the `service_role` / secret key in that file.

Reload the site: prices, availability and the pause switch go live instantly,
and `admin.html` / `orders.html` accept the same credentials as before.

## Notes

- `supabase-config.js` is the single place the URL and key live.
- If the key is empty the pages log a warning and fall back to the built-in
  prices, so the site never breaks while unconfigured.
- RLS: everyone may read prices / availability / site state; only the
  `admin@timeout.com.ng` account may write; customers may insert orders but
  only the admin may read them back.
- Orders are still e-mailed through Web3Forms as a second, independent record.
