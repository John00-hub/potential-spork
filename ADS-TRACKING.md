# Ad Tracking — Time Out Restaurant

The website is already wired to report every money-making tap to your ad
accounts. You only need to paste your pixel IDs **once**.

## 1. Paste your IDs (1 minute)

Open `redesign.js` and find this block near the bottom:

```js
var TO_TRACKING = {
  META_PIXEL_ID:   '',   // Facebook / Instagram ads
  TIKTOK_PIXEL_ID: '',   // TikTok ads
  GA4_ID:          ''    // Google Analytics / Google Ads
};
```

Put your ID(s) between the quotes, e.g. `META_PIXEL_ID: '1234567890123456'`.
Commit & push (or merge) — tracking goes live immediately. Leave any
platform you don't use blank; it costs nothing until an ID exists.

### Where to get the IDs
- **Meta (Facebook/Instagram):** Events Manager → your Pixel → the numeric ID under the pixel name.
- **TikTok:** TikTok Ads Manager → Tools → Events → your Pixel ID (starts with `C…`).
- **Google (GA4):** Google Analytics → Admin → Data streams → Measurement ID (`G-…`).

## 2. Events the site already fires

| What the customer does | Event sent | Meta equivalent |
|---|---|---|
| Taps "Explore the menu" / "Order Now" / hero deal | `OrderClick` | ViewContent |
| Adds any dish to cart | `AddToCart` | AddToCart |
| Taps "Proceed to Payment" | `BeginCheckout` | InitiateCheckout |
| Taps any WhatsApp button | `WhatsAppClick` | Contact |
| Taps Find Us / Get Directions | `DirectionsClick` | FindLocation |
| Taps the phone number | `CallClick` | Contact |
| Taps "Share with friends" | `ShareClick` | ViewContent |

Use these as **optimisation events / custom conversions** in Ads Manager,
and build retargeting audiences from `AddToCart` and `OrderClick` visitors
who didn't check out.

## 3. Recommended campaign setup (quick wins)

1. **Traffic/Conversion campaign → homepage.** The hero now leads with the
   ₦5,400 Jollof + Chicken deal, and mobile visitors always see the sticky
   *Order Now · WhatsApp · Directions* bar — no scrolling needed to buy.
2. **Location campaign → optimise for `DirectionsClick`.** Target a radius
   around Garki 2 / Area 11 / Central Area; the floating 📍 Find Us icon
   turns that traffic into foot traffic.
3. **WhatsApp campaign → optimise for `WhatsAppClick`.** Every WhatsApp
   button on the site fires it, so you can measure true cost-per-order-chat.
4. **Retargeting:** show the promo to anyone who fired `AddToCart` or
   `BeginCheckout` in the last 30 days but didn't buy.

## 4. Free (organic) traffic already set up

- `sitemap.xml` + `robots.txt` — submit `https://timeout.com.ng/sitemap.xml`
  once in Google Search Console.
- Restaurant + FAQ structured data on the homepage (eligible for rich
  results for "restaurant Garki Abuja", "best jollof Abuja" searches).
- WhatsApp/Facebook share card uses the jollof photo + "Good Food. Great
  Moments." headline — every shared link advertises itself.
- **Google Business Profile tip:** make sure the listing uses the same
  name/address/phone as the site — *Time Out Restaurant, 1245 Sapele
  Crescent, Apex Plaza, Garki 2, Abuja* — consistency is what makes the
  "near me" rankings and directions taps spike.

## 5. Notes

- Service worker is at **v3** — returning customers get the new design on
  their next visit automatically.
- The hero deal price mirrors the live promo price from the admin panel,
  so changing the promo price in `admin.html` updates both places.
