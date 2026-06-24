/* =========================================================
   Marta Marina — MusicMind · interactions
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Hero entrance ---------- */
  const hero = $('#hero');
  if (hero) requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('ready')));

  /* ---------- Hero symbol entrance ---------- */
  if (!reduceMotion) {
    const dot = $('.sym-dot'), left = $('.sym-left'), right = $('.sym-right');
    [left, right, dot].forEach((el) => { if (el) { el.style.opacity = '0'; } });
    if (dot) dot.style.transform = 'translateY(-40px)';
    setTimeout(() => {
      [left, right].forEach((el, i) => {
        if (!el) return;
        el.style.transition = 'opacity 1s cubic-bezier(.16,1,.3,1)';
        el.style.transitionDelay = (0.2 + i * 0.12) + 's';
        el.style.opacity = '1';
      });
      if (dot) {
        dot.style.transition = 'opacity .7s ease, transform 1.1s cubic-bezier(.34,1.56,.64,1)';
        dot.style.transitionDelay = '.5s';
        dot.style.opacity = '1';
        dot.style.transform = 'translateY(0)';
      }
    }, 250);
  }

  /* ---------- Header scroll state + hide-on-scroll-down ---------- */
  const header = $('#header');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 30);
    if (!document.body.classList.contains('menu-open')) {
      if (y > lastY && y > 400) header.classList.add('hidden');
      else header.classList.remove('hidden');
    }
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = $('#navToggle');
  const navLinks = $('#navLinks');
  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('a', navLinks).forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Parallax blobs ---------- */
  const parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('[data-magnetic]').forEach((el) => {
      const strength = 18;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Active nav link (scrollspy) ---------- */
  const sections = ['musicmind', 'metodo', 'programas', 'marta', 'contacto']
    .map((id) => document.getElementById(id)).filter(Boolean);
  const navAnchors = $$('.nav__links .navlink');
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navAnchors.forEach((a) => a.style.opacity = a.getAttribute('href') === '#' + id ? '1' : '0.55');
        }
      });
    }, { threshold: 0.5 });
    sections.forEach((s) => spy.observe(s));
  }

  /* =========================================================
     MODAL (wide, cinematic)
     ========================================================= */
  const overlay = $('#overlay');
  const modal = $('#modal');
  const modalAside = $('#modalAside');
  const modalBody = $('#modalBody');
  const modalFoot = $('#modalFoot');
  const modalClose = $('#modalClose');
  let lastFocused = null;

  const SYM_SVG = '<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill="#fff" d="M115.29,114.97l-.14-47.2-26.88,28.69c4.1,3.85,6.71,7.62,6.75,13.3.03,3.31-.93,6.23-3,8.88-5.97,7.66-17.3,7.72-23.19,1.03-2.62-2.98-4.01-6.72-3.81-10.57.31-5.89,3.22-8.78,6.86-12.89-.16-.19-26.84-28.7-26.84-28.7l-.24,47.58c0,2.38-1.83,3.85-3.94,4.63-2.72,1-7.59-.98-7.6-4.54l-.14-62.1c0-1.65,1.03-3.34,2.11-4.19,3.31-2.62,7.32-1.51,9.98,1.42l35.03,38.17,34.16-37.66c2.71-3.14,6.75-4.63,10.24-1.98,1.78,1.35,2.18,3.72,2.18,5.93l-.13,60.24c0,3.23-3.89,5.27-6.62,4.89-2.46-.35-4.8-2.11-4.81-4.92ZM80.09,102.94c-.41.02-4.93,3.38-4.76,7.07.1,2.28,1.64,3.77,3.35,4.34,1.96.65,4.01-.13,5.1-1.48,3.84-4.73-3.37-9.95-3.69-9.93Z"/>' +
    '<circle fill="#CCC2B8" cx="80.2" cy="46.68" r="11.23"/></svg>';
  const RINGS_SVG = '<svg class="rings" viewBox="0 0 400 400" fill="none" stroke="currentColor" stroke-width="0.8">' +
    '<circle cx="200" cy="200" r="60"/><circle cx="200" cy="200" r="110"/><circle cx="200" cy="200" r="160"/><circle cx="200" cy="200" r="198"/>' +
    '<line x1="200" y1="2" x2="200" y2="398"/><line x1="2" y1="200" x2="398" y2="200"/>' +
    '<line x1="60" y1="60" x2="340" y2="340"/><line x1="340" y1="60" x2="60" y2="340"/></svg>';

  function buildFoot(footData) {
    modalFoot.innerHTML = '';
    let items = [];
    try { items = footData ? JSON.parse(footData) : []; } catch (_) { items = []; }
    if (!items.length) { modalFoot.style.display = 'none'; return; }
    modalFoot.style.display = 'flex';
    items.forEach((it) => {
      const a = document.createElement('a');
      a.href = it.h || '#contacto';
      a.className = 'btn' + (it.p ? '' : ' btn--ghost');
      a.innerHTML = it.p ? `${it.t} <span class="arrow">→</span>` : it.t;
      a.addEventListener('click', (e) => {
        if ((it.h || '') === '#contacto') { e.preventDefault(); openModal('contact'); }
        else closeModal();
      });
      modalFoot.appendChild(a);
    });
  }

  function openModal(id) {
    const tpl = document.getElementById('tpl-' + id);
    if (!tpl) return;
    const node = tpl.content.cloneNode(true);
    const root = node.querySelector('div');

    const eyebrow = root.dataset.eyebrow || 'MusicMind';
    const num = root.dataset.num || '';

    modalAside.className = 'modal__aside' + (num ? '' : ' no-num');
    modalAside.innerHTML = RINGS_SVG +
      `<span class="a-eyebrow">${eyebrow}</span>` +
      `<span class="a-symbol">${SYM_SVG}</span>` +
      (num ? `<span class="a-num">${num}</span>` : '');

    buildFoot(root.dataset.foot);

    modalBody.innerHTML = '';
    while (root.firstChild) modalBody.appendChild(root.firstChild);
    modalBody.scrollTop = 0;

    lastFocused = document.activeElement;
    overlay.classList.add('open');
    modal.classList.add('open');
    document.body.classList.add('no-scroll');
    setTimeout(() => modalClose.focus(), 80);
  }

  function closeModal() {
    overlay.classList.remove('open');
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
    if (lastFocused) setTimeout(() => lastFocused.focus(), 0);
  }

  $$('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });
  overlay.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !modal.classList.contains('open')) return;
    const f = modal.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */
  const cursor = $('#cursor'), cursorDot = $('#cursorDot');
  if (cursor && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let rx = cx, ry = cy;
    window.addEventListener('mousemove', (e) => {
      cx = e.clientX; cy = e.clientY;
      cursorDot.style.transform = `translate(${cx}px, ${cy}px)`;
    });
    const loop = () => {
      rx += (cx - rx) * 0.18; ry += (cy - ry) * 0.18;
      cursor.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-down'));
    document.addEventListener('mouseup', () => document.body.classList.remove('cursor-down'));
    const hoverSel = 'a, button, .card, input, [data-modal], [data-magnetic]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSel)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSel)) document.body.classList.remove('cursor-hover');
    });
  }

  /* =========================================================
     3D TILT on cards
     ========================================================= */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('.card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotateX(${-py * 6}deg) rotateY(${px * 6}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* =========================================================
     SCROLL PROGRESS
     ========================================================= */
  const progress = $('#progress');
  if (progress) {
    const setProg = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    };
    window.addEventListener('scroll', setProg, { passive: true });
    window.addEventListener('resize', setProg);
    setProg();
  }

  /* =========================================================
     COUNT-UP stats
     ========================================================= */
  $$('.marta__stats .st b').forEach((el) => {
    const m = el.textContent.trim().match(/^(\d+)(\D*)$/);
    if (!m) return;
    const target = parseInt(m[1], 10), suffix = m[2];
    el.dataset.done = '0';
    const run = () => {
      if (el.dataset.done === '1') return; el.dataset.done = '1';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const dur = 1100; let start = null;
      const step = (t) => {
        if (start === null) start = t;
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const o = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { run(); o.disconnect(); } }), { threshold: 0.6 });
      o.observe(el);
    } else { run(); }
  });

  /* =========================================================
     BRAND STORY slider
     ========================================================= */
  (function story() {
    const sec = $('#story');
    if (!sec) return;
    const phrases = $$('.story__phrase', sec);
    const dotsWrap = $('#storyDots');
    const countEl = $('#storyCount');
    const prev = $('#storyPrev'), next = $('#storyNext');
    const total = phrases.length;
    let i = 0, timer = null, inView = true;

    phrases.forEach((_, idx) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', 'Ir a la frase ' + (idx + 1));
      if (idx === 0) b.classList.add('on');
      b.addEventListener('click', () => { go(idx); restart(); });
      dotsWrap.appendChild(b);
    });
    const dots = $$('button', dotsWrap);

    function go(n) {
      i = (n + total) % total;
      phrases.forEach((p, idx) => p.classList.toggle('active', idx === i));
      dots.forEach((d, idx) => d.classList.toggle('on', idx === i));
      countEl.textContent = String(i + 1).padStart(2, '0');
      sec.dataset.active = String(i);
    }
    const adv = () => go(i + 1);
    function start() { if (!reduceMotion && inView) timer = setInterval(adv, 4800); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    prev.addEventListener('click', () => { go(i - 1); restart(); });
    next.addEventListener('click', () => { go(i + 1); restart(); });
    sec.addEventListener('mouseenter', stop);
    sec.addEventListener('mouseleave', start);

    // swipe
    let sx = null;
    sec.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    sec.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 50) { go(i + (dx < 0 ? 1 : -1)); restart(); }
      sx = null;
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((ents) => ents.forEach((en) => {
        inView = en.isIntersecting; inView ? start() : stop();
      }), { threshold: 0.25 }).observe(sec);
    } else { start(); }
  })();

  /* =========================================================
     NEWSLETTER  (Google Apps Script)
     ========================================================= */
  // 1) Despliega apps-script/Code.gs como Web App
  // 2) Pega aquí la URL /exec que te da Google:
  const NEWSLETTER_ENDPOINT = ''; // <-- PEGA AQUÍ TU URL DE APPS SCRIPT

  const form = $('#newsForm');
  const emailInput = $('#newsEmail');
  const msg = $('#newsMsg');
  const newsBtn = $('#newsBtn');

  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function setMsg(text, type) {
    msg.textContent = text;
    msg.className = 'news__msg' + (type ? ' ' + type : '');
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!validEmail(email)) { setMsg('Introduce un email válido.', 'err'); emailInput.focus(); return; }

      newsBtn.disabled = true;
      const original = newsBtn.innerHTML;
      newsBtn.innerHTML = 'Enviando…';
      setMsg('', '');

      try {
        if (!NEWSLETTER_ENDPOINT) {
          // Modo demo: aún no hay endpoint configurado.
          await new Promise((r) => setTimeout(r, 700));
          setMsg('✓ ¡Gracias! (modo demo — configura el endpoint de Apps Script para recibir altas).', 'ok');
          form.reset();
        } else {
          const body = new URLSearchParams({ email, source: 'web' });
          const res = await fetch(NEWSLETTER_ENDPOINT, { method: 'POST', body });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.result === 'success') {
            setMsg('✓ ¡Listo! Te has suscrito correctamente.', 'ok');
            form.reset();
          } else {
            setMsg(data.message || 'Algo ha fallado. Inténtalo de nuevo.', 'err');
          }
        }
      } catch (_) {
        setMsg('No se pudo conectar. Inténtalo más tarde.', 'err');
      } finally {
        newsBtn.disabled = false;
        newsBtn.innerHTML = original;
      }
    });
  }

  /* =========================================================
     CONTACT FORM  (modal · same Apps Script endpoint)
     ========================================================= */
  if (modalBody) {
    modalBody.addEventListener('submit', async (e) => {
      const cform = e.target;
      if (!cform || cform.id !== 'contactForm') return;
      e.preventDefault();

      const name = cform.elements.name.value.trim();
      const email = cform.elements.email.value.trim();
      const message = cform.elements.message.value.trim();
      const cmsg = cform.querySelector('#contactMsg');
      const cbtn = cform.querySelector('#contactBtn');
      const setC = (t, type) => { cmsg.textContent = t; cmsg.className = 'c-msg' + (type ? ' ' + type : ''); };

      if (!name) { setC('Dime tu nombre.', 'err'); cform.elements.name.focus(); return; }
      if (!validEmail(email)) { setC('Introduce un email válido.', 'err'); cform.elements.email.focus(); return; }
      if (message.length < 5) { setC('Cuéntame un poco más.', 'err'); cform.elements.message.focus(); return; }

      cbtn.disabled = true;
      const orig = cbtn.innerHTML;
      cbtn.innerHTML = 'Enviando…';
      setC('', '');

      try {
        if (!NEWSLETTER_ENDPOINT) {
          await new Promise((r) => setTimeout(r, 700));
          setC('✓ ¡Gracias! (modo demo — configura el endpoint de Apps Script para recibir mensajes).', 'ok');
          cform.reset();
        } else {
          const body = new URLSearchParams({ type: 'contact', name, email, message, source: 'web' });
          const res = await fetch(NEWSLETTER_ENDPOINT, { method: 'POST', body });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.result === 'success') {
            setC('✓ ¡Mensaje enviado! Te responderé pronto.', 'ok');
            cform.reset();
          } else {
            setC(data.message || 'Algo ha fallado. Inténtalo de nuevo.', 'err');
          }
        }
      } catch (_) {
        setC('No se pudo conectar. Inténtalo más tarde.', 'err');
      } finally {
        cbtn.disabled = false;
        cbtn.innerHTML = orig;
      }
    });
  }

})();
