/**
 * ESPAI SALUT — JavaScript principal
 * espaisalutrubi.es
 * Versió: 1.0 | Juny 2026
 */

'use strict';

/* ================================================
   UTILITATS
   ================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ================================================
   HEADER SCROLL
   ================================================ */
function initHeader() {
  const header = $('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ================================================
   NAVEGACIÓ MÒBIL
   ================================================ */
function initMobileNav() {
  const toggle = $('.nav-toggle');
  const menu   = $('.mobile-menu');
  if (!toggle || !menu) return;

  const open  = () => {
    toggle.classList.add('active');
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    toggle.classList.remove('active');
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    toggle.classList.contains('active') ? close() : open();
  });

  // Tancar en clicar fora
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !toggle.contains(e.target)) {
      close();
    }
  });

  // Tancar en ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });

  // Tancar en clicar un link del menú
  $$('a', menu).forEach(a => a.addEventListener('click', close));
}

/* ================================================
   FAQ ACORDIÓ
   ================================================ */
function initFAQ() {
  $$('.faq-item').forEach(item => {
    const btn    = $('.faq-question', item);
    const answer = $('.faq-answer', item);
    if (!btn || !answer) return;

    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', answer.id || '');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Tancar tots els altres
      $$('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          $('.faq-question', other)?.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* ================================================
   CAROUSEL
   ================================================ */
function initCarousel(carouselEl) {
  if (!carouselEl) return;

  const track    = $('.carousel__track', carouselEl);
  const slides   = $$('.carousel__slide', carouselEl);
  const prevBtn  = $('.carousel__btn--prev', carouselEl);
  const nextBtn  = $('.carousel__btn--next', carouselEl);
  const dotsWrap = $('.carousel__dots', carouselEl);

  if (!track || slides.length === 0) return;

  let current    = 0;
  const total    = slides.length;
  let autoTimer  = null;
  let isTouch    = false;
  let startX     = 0;

  // Crear dots
  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Imatge ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    if (dotsWrap) {
      $$('.carousel__dot', dotsWrap).forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { clearAuto(); goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { clearAuto(); goTo(current + 1); startAuto(); });

  // Autoplay
  function startAuto() {
    clearAuto();
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }

  function clearAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  // Touch/swipe
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isTouch = true; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (!isTouch) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      clearAuto();
      goTo(current + (diff > 0 ? 1 : -1));
      startAuto();
    }
    isTouch = false;
  });

  // Pause on hover
  carouselEl.addEventListener('mouseenter', clearAuto);
  carouselEl.addEventListener('mouseleave', startAuto);

  startAuto();
}

function initAllCarousels() {
  $$('.carousel').forEach(initCarousel);
}

/* ================================================
   FORMULARI DE CONTACTE — validació + honeypot
   ================================================ */
function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const honeypot  = form.querySelector('.form-honeypot input');
  const msgOk     = $('#form-success');
  const msgErr    = $('#form-error');

  function showError(input, msg) {
    input.classList.add('error');
    const errEl = input.parentElement.querySelector('.form-error');
    if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
  }

  function clearError(input) {
    input.classList.remove('error');
    const errEl = input.parentElement.querySelector('.form-error');
    if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^[+]?[\d\s\-().]{7,20}$/.test(phone);
  }

  // Validació en temps real
  $$('[required]', form).forEach(field => {
    field.addEventListener('blur', () => {
      if (!field.value.trim()) {
        showError(field, 'Camp obligatori');
      } else if (field.type === 'email' && !validateEmail(field.value)) {
        showError(field, 'Adreça electrònica no vàlida');
      } else if (field.name === 'telefon' && !validatePhone(field.value)) {
        showError(field, 'Telèfon no vàlid');
      } else {
        clearError(field);
      }
    });
    field.addEventListener('input', () => clearError(field));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot check — si té valor, és un bot
    if (honeypot && honeypot.value) return;

    let valid = true;
    $$('[required]', form).forEach(field => {
      if (!field.value.trim()) {
        showError(field, 'Camp obligatori');
        valid = false;
      } else if (field.type === 'email' && !validateEmail(field.value)) {
        showError(field, 'Adreça electrònica no vàlida');
        valid = false;
      }
    });

    const consent = form.querySelector('[name="consentiment"]');
    if (consent && !consent.checked) {
      showError(consent, 'Has d\'acceptar la política de privacitat per enviar el formulari');
      valid = false;
    }

    if (!valid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviant…';

    // Aquí conectes amb el teu backend o formulari Formspree/Netlify
    // Simulació: descomentar i adaptar a la teva solució
    /*
    try {
      const data = new FormData(form);
      const res  = await fetch('URL_DEL_TEU_ENDPOINT', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        if (msgOk) msgOk.style.display = 'block';
        form.reset();
      } else {
        throw new Error('Error del servidor');
      }
    } catch {
      if (msgErr) msgErr.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar missatge';
    }
    */

    // DEMO (treure quan hi hagi backend real):
    setTimeout(() => {
      if (msgOk) { msgOk.style.display = 'block'; msgOk.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar missatge';
    }, 1000);
  });
}

/* ================================================
   COOKIE CONSENT — conforme AEPD
   ================================================ */
const COOKIE_KEY = 'espaisalut_cookie_consent';

function getCookieConsent() {
  try { return JSON.parse(localStorage.getItem(COOKIE_KEY)); } catch { return null; }
}

function setCookieConsent(prefs) {
  localStorage.setItem(COOKIE_KEY, JSON.stringify({ ...prefs, date: new Date().toISOString() }));
}

function applyCookiePrefs(prefs) {
  if (prefs.analytics) {
    // Activar Google Analytics
    // window['ga-disable-G-XXXXXXXX'] = false;
  }
}

function initCookieBanner() {
  const banner      = $('#cookie-banner');
  const modal       = $('#cookie-modal');
  if (!banner) return;

  const consent = getCookieConsent();
  if (!consent) {
    setTimeout(() => banner.classList.add('visible'), 1200);
  } else {
    applyCookiePrefs(consent);
  }

  // Acceptar tot
  $('#cookie-accept-all')?.addEventListener('click', () => {
    const prefs = { necessary: true, analytics: true, marketing: false };
    setCookieConsent(prefs);
    applyCookiePrefs(prefs);
    banner.classList.remove('visible');
  });

  // Rebutjar opcionals
  $('#cookie-reject')?.addEventListener('click', () => {
    const prefs = { necessary: true, analytics: false, marketing: false };
    setCookieConsent(prefs);
    banner.classList.remove('visible');
  });

  // Configurar
  $('#cookie-configure')?.addEventListener('click', () => {
    if (modal) { modal.classList.add('open'); banner.classList.remove('visible'); }
  });

  // Tancar modal
  $('#cookie-modal-close')?.addEventListener('click', () => modal?.classList.remove('open'));

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  // Guardar preferències del modal
  $('#cookie-save-prefs')?.addEventListener('click', () => {
    const analytics = !!$('#cookie-toggle-analytics')?.checked;
    const marketing = !!$('#cookie-toggle-marketing')?.checked;
    const prefs = { necessary: true, analytics, marketing };
    setCookieConsent(prefs);
    applyCookiePrefs(prefs);
    modal?.classList.remove('open');
  });
}

/* ================================================
   LINK DE WHATSAPP AMB MISSATGE PRE-EMPLENAT
   ================================================ */
function initWhatsApp() {
  const WA_NUMBER = '34644467353';
  $$('[data-whatsapp]').forEach(el => {
    const msg     = el.dataset.whatsapp || 'Hola, m\'agradaria demanar informació sobre els serveis d\'Espai Salut.';
    const encoded = encodeURIComponent(msg);
    el.href       = `https://wa.me/${WA_NUMBER}?text=${encoded}`;
    el.target     = '_blank';
    el.rel        = 'noopener noreferrer';
  });
}

/* ================================================
   ANIMACIÓ EN SCROLL (Intersection Observer)
   ================================================ */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const elements = $$('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ================================================
   DROPDOWN NAVEGACIÓ (click-based, accessible)
   ================================================ */
function initDropdowns() {
  $$('.nav-dropdown').forEach(dropdown => {
    const trigger = $('.nav-dropdown__trigger', dropdown);
    const menu    = $('.nav-dropdown__menu', dropdown);
    if (!trigger || !menu) return;

    const open = () => {
      dropdown.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      dropdown.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    };
    const toggle = () => dropdown.classList.contains('open') ? close() : open();

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    // Tancar en clicar fora
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) close();
    });

    // Tancar en ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Tancar en clicar un link del menú
    $$('a', menu).forEach(a => a.addEventListener('click', close));
  });
}

/* ================================================
   SMOOTH SCROLL PER A ANCRES INTERNES
   ================================================ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset - 16,
        behavior: 'smooth'
      });
    });
  });
}

/* ================================================
   ACTIVE NAV LINK
   ================================================ */
function initActiveNav() {
  const path = window.location.pathname;
  $$('.nav-link, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.endsWith(href) && href !== '/') {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ================================================
   INICIALITZACIÓ GLOBAL
   ================================================ */
function initAll() {
  initHeader();
  initMobileNav();
  initDropdowns();
  initAllCarousels();
  initFAQ();
  initScrollAnimations();
  initSmoothScroll();
  initActiveNav();
  initContactForm();
  initCookieBanner();
  initWhatsApp();
}

// Funciona tant amb defer com sense
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
