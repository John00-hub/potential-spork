/* ═══════════════════════════════════════════════════════════════
   TIME OUT RESTAURANT — redesign helpers (safe on every page)
   1. Injects the floating "Find Us" directions icon
      → one tap opens Google Maps directions to the restaurant.
   2. Live Open / Closed status (Africa/Lagos time).
   3. Scroll-reveal for the new redesign sections.
   Does NOT touch menu, cart, Firebase or Paystack logic.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Restaurant facts (single source for the redesign) ── */
  var ADDRESS = '1245 Sapele Crescent, Apex Plaza, Garki 2, Abuja, FCT, Nigeria';
  var DIRECTIONS_URL =
    'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' +
    encodeURIComponent('Time Out Restaurant, ' + ADDRESS);

  var PIN_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' +
    '<path d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.6 7.5 12.5 7.5 12.5s7.5-6.9 7.5-12.5A7.5 7.5 0 0 0 12 2Zm0 10.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z"/></svg>';

  /* ── 1 · Floating Find-Us directions icon ── */
  function injectFindUsFab() {
    if (document.querySelector('.findus-fab')) return;

    var fab = document.createElement('a');
    fab.className = 'findus-fab';
    fab.href = DIRECTIONS_URL;
    fab.target = '_blank';
    fab.rel = 'noopener noreferrer';
    fab.setAttribute(
      'aria-label',
      'Get directions to Time Out Restaurant, ' + ADDRESS + ' (opens Google Maps)'
    );
    fab.innerHTML =
      '<span class="findus-pin" aria-hidden="true">' + PIN_SVG + '</span>' +
      '<span class="findus-text"><strong>Find Us</strong><span>Get directions →</span></span>' +
      '<span class="findus-hint" aria-hidden="true">Tap for directions to the restaurant 📍</span>';

    fab.addEventListener('click', function () {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'directions_click', {
          event_category: 'engagement',
          event_label: 'floating_findus_icon'
        });
      }
    });

    document.body.appendChild(fab);

    /* First visit on touch devices: briefly explain the round icon */
    try {
      if (!sessionStorage.getItem('findusHintSeen')) {
        setTimeout(function () { fab.classList.add('show-hint'); }, 1600);
        setTimeout(function () {
          fab.classList.remove('show-hint');
          sessionStorage.setItem('findusHintSeen', '1');
        }, 6600);
      }
    } catch (e) { /* private mode — ignore */ }

    /* Hide it while the Visit / map section is already on screen */
    var visit = document.getElementById('find-us') || document.querySelector('.visit-section');
    if (visit && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          fab.classList.toggle('findus-hidden', en.isIntersecting);
        });
      }, { threshold: 0.18 }).observe(visit);
    }
  }

  /* ── 2 · Live open/closed status, Lagos time ──
       Hours: Mon–Sat 9:00–22:00 · Sun 12:00–22:00 */
  function lagosNow() {
    return new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' })
    );
  }
  function openStatus() {
    var now = lagosNow();
    var day = now.getDay(); /* 0 = Sunday */
    var mins = now.getHours() * 60 + now.getMinutes();
    var openMins = (day === 0 ? 12 : 9) * 60;
    var closeMins = 22 * 60;
    if (mins >= openMins && mins < closeMins) {
      return { open: true, text: 'Open now · Closes 10pm' };
    }
    if (mins < openMins) {
      return { open: false, text: 'Closed · Opens ' + (day === 0 ? '12 noon' : '9am') + ' today' };
    }
    var nextIsSunday = (day + 1) % 7 === 0;
    return { open: false, text: 'Closed · Opens ' + (nextIsSunday ? '12 noon' : '9am') + ' tomorrow' };
  }
  function paintOpenStatus() {
    var s = openStatus();
    document.querySelectorAll('[data-open-status]').forEach(function (el) {
      var label = el.querySelector('[data-open-text]') || el;
      label.textContent = s.text;
      el.classList.toggle('is-closed', !s.open);
    });
  }

  /* ── 3 · Scroll reveal for redesign sections ── */
  function initReveal() {
    var els = document.querySelectorAll('.rd-reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('rd-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('rd-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  function init() {
    injectFindUsFab();
    paintOpenStatus();
    setInterval(paintOpenStatus, 60000); /* keep it fresh */
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ═══════════════════════════════════════════════════════════════
   AD TRACKING — paste your IDs here and every Order / WhatsApp /
   Directions / Call / Share tap starts reporting to your ad
   accounts automatically. Empty = that platform stays off.
   Full guide: ADS-TRACKING.md
   ═══════════════════════════════════════════════════════════════ */
var TO_TRACKING = {
  META_PIXEL_ID:   '',   /* e.g. '1234567890123456' — Facebook / Instagram ads */
  TIKTOK_PIXEL_ID: '',   /* e.g. 'CXXXXXXXXXXXXXXX' — TikTok ads */
  GA4_ID:          ''    /* e.g. 'G-XXXXXXXXXX'     — Google Analytics / Google Ads */
};

(function () {
  'use strict';

  /* ── load pixels only when an ID is provided (zero cost until then) ── */
  function loadMeta(id) {
    if (!id || window.fbq) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', id); window.fbq('track', 'PageView');
  }
  function loadTikTok(id) {
    if (!id || window.ttq) return;
    (function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
    ttq.methods=['track','page','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];
    ttq.factory=function(m){return function(){ttq.push([m].concat([].slice.call(arguments,0)))}};
    for(var i=0;i<ttq.methods.length;i++)ttq[ttq.methods[i]]=ttq.factory(ttq.methods[i]);
    ttq.instance=function(pid){for(var i=0;i<ttq._i.length;i++)if(ttq._i[i]._u===pid)return ttq._i[i];
    var inst={_u:pid};ttq.methods.forEach(function(m){inst[m]=ttq.factory(m)});ttq._i.push(inst);return inst};
    ttq._i=[];ttq.load=function(pid){var s=d.createElement('script');s.async=!0;
    s.src='https://analytics.tiktok.com/i18n/pixel/events.js?sdkid='+pid+'&lib='+t;
    var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);ttq.instance(pid);ttq.page()};
    ttq.load(id);})(window,document,'ttq');
  }
  function loadGA(id) {
    if (!id || window.gtag) return;
    var s = document.createElement('script'); s.async = !0;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', id);
  }

  /* ── one funnel for every conversion tap ── */
  window.toTrack = function (eventName, label) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, event_label: label || '' });
      if (typeof window.gtag === 'function')
        window.gtag('event', eventName, { event_category: 'conversion', event_label: label || '' });
      if (typeof window.fbq === 'function') {
        var fb = { AddToCart: 'AddToCart', BeginCheckout: 'InitiateCheckout',
                   OrderClick: 'ViewContent', WhatsAppClick: 'Contact',
                   DirectionsClick: 'FindLocation', CallClick: 'Contact', ShareClick: 'ViewContent' }[eventName] || 'ViewContent';
        window.fbq('track', fb, { content_name: label || eventName });
      }
      if (window.ttq && typeof window.ttq.track === 'function')
        window.ttq.track(eventName === 'BeginCheckout' ? 'InitiateCheckout' : 'ClickButton', { content_name: label || eventName });
    } catch (e) { /* tracking must never break ordering */ }
  };

  /* ── delegate: works for menu cards rendered later by Firebase/menu JS ── */
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('a, button');
    if (!el) return;
    var href = el.getAttribute && el.getAttribute('href') || '';
    if (el.id === 'exploreBtn' || el.classList.contains('sob-btn--order')) window.toTrack('OrderClick', 'explore_menu');
    else if (href.indexOf('wa.me') > -1) window.toTrack('WhatsAppClick', el.textContent.trim().slice(0, 40));
    else if (href.indexOf('maps/dir') > -1 || href.indexOf('maps.google') > -1 || el.classList.contains('findus-fab')) window.toTrack('DirectionsClick', 'google_maps');
    else if (href.indexOf('tel:') === 0) window.toTrack('CallClick', href);
    else if (el.classList.contains('add-cart-btn')) window.toTrack('AddToCart', 'menu_item');
    else if (el.id === 'checkoutBtn') window.toTrack('BeginCheckout', 'cart');
    else if (el.id === 'promoCta') window.toTrack('AddToCart', 'promo_jollof_chicken');
    else if (el.classList.contains('hero-deal')) window.toTrack('OrderClick', 'hero_deal');
  }, { passive: true });

  /* ── mirror live promo price into the hero deal strip ── */
  function mirrorPromoPrice() {
    var src = document.getElementById('promoPriceMain');
    if (!src) return;
    var apply = function () {
      document.querySelectorAll('[data-promo-price]').forEach(function (t) { t.textContent = src.textContent; });
    };
    apply();
    if ('MutationObserver' in window)
      new MutationObserver(apply).observe(src, { childList: true, characterData: true, subtree: true });
  }

  /* ── share (native sheet → WhatsApp etc., clipboard fallback) ── */
  function initShare() {
    var btn = document.getElementById('shareBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.toTrack('ShareClick', 'visit_section');
      var data = {
        title: 'Time Out Restaurant Abuja — Good Food. Great Moments.',
        text: 'Smoky jollof, Nigerian soups, grills & shawarma in Garki 2, Abuja. Order here:',
        url: 'https://timeout.com.ng/'
      };
      var label = document.getElementById('shareBtnText');
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      var done = function () { if (label) { label.textContent = 'Link copied ✓'; setTimeout(function(){ label.textContent = 'Share with friends'; }, 2500); } };
      if (navigator.clipboard) navigator.clipboard.writeText(data.url).then(done).catch(done);
      else done();
    });
  }

  function initAds() {
    loadMeta(TO_TRACKING.META_PIXEL_ID);
    loadTikTok(TO_TRACKING.TIKTOK_PIXEL_ID);
    loadGA(TO_TRACKING.GA4_ID);
    mirrorPromoPrice();
    initShare();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAds);
  else initAds();
})();
