/* ===== GLOBAL SCRIPT.JS — Timeout Restaurant ===== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== NAVBAR SCROLL =====
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // ===== HAMBURGER MENU =====
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ===== ACTIVE NAV LINK =====
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ===== SCROLL REVEAL =====
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => observer.observe(el));
  }

  // ===== TOAST UTILITY =====
  window.showToast = function(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  };

  // ===== CONTACT FORM =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = 'Sending...';
      setTimeout(() => {
        btn.textContent = 'Message Sent ✓';
        btn.style.background = '#2d6a4f';
        showToast('✓ Message received! We\'ll reach out shortly.');
        contactForm.reset();
        setTimeout(() => {
          btn.textContent = 'Send Message';
          btn.style.background = '';
        }, 3000);
      }, 1200);
    });
  }

  // ===== PARALLAX HERO =====
  const heroParallax = document.querySelector('.hero-parallax-bg');
  if (heroParallax) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      heroParallax.style.transform = `translateY(${scrolled * 0.4}px)`;
    }, { passive: true });
  }

  // ===== MENU FILTER TABS =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.menu-item-card');
  if (filterBtns.length && menuItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        menuItems.forEach(item => {
          if (cat === 'all' || item.dataset.cat === cat) {
            item.style.display = '';
            item.style.animation = 'fadeInUp 0.4s ease forwards';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // ===== TESTIMONIAL SLIDER =====
  const track = document.querySelector('.testimonials-track');
const dots = document.querySelectorAll('.t-dot');
let index = 0;

function showSlide(i) {
  track.style.transform = `translateX(-${i * 100}%)`;
  dots.forEach(dot => dot.classList.remove('active'));
  dots[i].classList.add('active');
}

document.querySelector('.t-next').addEventListener('click', () => {
  index = (index + 1) % dots.length;
  showSlide(index);
});

document.querySelector('.t-prev').addEventListener('click', () => {
  index = (index - 1 + dots.length) % dots.length;
  showSlide(index);
});

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    index = i;
    showSlide(index);
  });
});

// Optional: auto slide
setInterval(() => {
  index = (index + 1) % dots.length;
  showSlide(index);
}, 5000);
  const slider = document.querySelector('.testimonials-track');
  if (slider) {
    let current = 0;
    const cards = slider.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.t-dot');
    const total = cards.length;

    function goTo(n) {
      current = (n + total) % total;
      slider.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    document.querySelector('.t-prev')?.addEventListener('click', () => goTo(current - 1));
    document.querySelector('.t-next')?.addEventListener('click', () => goTo(current + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    setInterval(() => goTo(current + 1), 5000);
  }

});
