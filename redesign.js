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
