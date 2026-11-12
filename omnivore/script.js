/* ==========================================================================
   Omnivore — behaviour
   Everything here is progressive enhancement: without JS the page still
   works (the sorting screen runs on CSS radio buttons).
   ========================================================================== */

document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupReveal();
  setupHeroFeeding();
  setupHeroLean();
  setupSortingScreen();
});

/* ---------- mobile nav toggle ---------- */
function setupNav() {
  const top = document.querySelector('.top');
  const btn = top?.querySelector('.nav-toggle');
  if (!btn) return;

  function set(open) {
    top.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  btn.addEventListener('click', () => set(!top.classList.contains('open')));
  top.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && top.classList.contains('open')) { set(false); btn.focus(); }
  });
  window.matchMedia('(min-width: 701px)').addEventListener('change', (m) => { if (m.matches) set(false); });
}

/* ---------- scroll reveal ---------- */
function setupReveal() {
  const targets = document.querySelectorAll('[data-reveal], .shelf, .menu, .quote-goober');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el) => io.observe(el));
}

/* ---------- hero: snacks fly into the goober's mouth ---------- */
function setupHeroFeeding() {
  const art = document.querySelector('.hero-art');
  if (!art) return;

  const goober = art.querySelector('.hero-goober');
  const nom = art.querySelector('.nom');
  const hint = art.querySelector('.hint');
  const flies = [...art.querySelectorAll('.fly')];
  const noms = ['nom?', 'nom.', 'NOM!', 'more?', 'mmm', '*gulp*'];
  let busy = false;
  let timer = null;
  let visible = true;
  let n = 0;

  // Where the mouth sits inside the goober artwork (fractions of its box).
  const MOUTH = { x: 0.47, y: 0.44 };

  function feed(fly) {
    if (busy || reduceMotion || !fly.animate) return;
    busy = true;

    const f = fly.getBoundingClientRect();
    const g = goober.getBoundingClientRect();
    const dx = (g.left + g.width * MOUTH.x) - (f.left + f.width / 2);
    const dy = (g.top + g.height * MOUTH.y) - (f.top + f.height / 2);

    const flight = fly.animate([
      { transform: 'translate(0, 0) rotate(0) scale(1)' },
      { transform: `translate(${dx * -0.06}px, ${-18}px) rotate(-14deg) scale(1.08)`, offset: 0.22 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 40}px) rotate(160deg) scale(.8)`, offset: 0.62 },
      { transform: `translate(${dx}px, ${dy}px) rotate(320deg) scale(.15)`, opacity: 0.9 },
    ], { duration: 820, easing: 'cubic-bezier(.45, 0, .55, 1)', fill: 'forwards' });

    flight.onfinish = () => {
      fly.style.opacity = '0';
      flight.cancel();

      goober.animate([
        { transform: 'scale(1, 1)' },
        { transform: 'scale(1.06, .9)', offset: 0.25 },
        { transform: 'scale(.97, 1.05)', offset: 0.55 },
        { transform: 'scale(1.01, .99)', offset: 0.8 },
        { transform: 'scale(1, 1)' },
      ], { duration: 650, easing: 'ease-out' });

      nom.textContent = noms[n++ % noms.length];
      nom.classList.remove('pop');
      void nom.offsetWidth; // restart the pop animation
      nom.classList.add('pop');

      // the snack drifts back in, ready to be eaten again
      setTimeout(() => {
        fly.style.opacity = '';
        fly.animate([
          { opacity: 0, transform: 'translateY(-30px) scale(.6)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ], { duration: 700, easing: 'cubic-bezier(.34, 1.56, .64, 1)' });
        busy = false;
      }, 900);
    };
  }

  function loop() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (visible && !document.hidden) feed(flies[Math.floor(Math.random() * flies.length)]);
      loop();
    }, 3400 + Math.random() * 1600);
  }

  flies.forEach((fly) => fly.addEventListener('click', () => {
    hint?.classList.add('gone');
    feed(fly);
    loop(); // reset the auto timer so it doesn't double up
  }));

  if (reduceMotion) return;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(art);
  }
  loop();
}

/* ---------- hero: goober leans toward the cursor ---------- */
function setupHeroLean() {
  const art = document.querySelector('.hero-art');
  const wrap = art?.querySelector('.goober-wrap');
  if (!wrap || reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

  let tx = 0, x = 0, raf = null;

  function tick() {
    x += (tx - x) * 0.08;
    wrap.style.setProperty('--px', `${x * 14}px`);
    wrap.style.setProperty('--pr', `${x * 2}deg`);
    raf = Math.abs(tx - x) > 0.001 ? requestAnimationFrame(tick) : null;
  }

  window.addEventListener('pointermove', (e) => {
    const r = art.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width)));
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
}

/* ---------- sorting screen: a short "chewing" beat before the reveal ---------- */
function setupSortingScreen() {
  const screen = document.querySelector('#screen .screen');
  const chewItem = screen?.querySelector('.chew-item');
  if (!screen || !chewItem) return;

  let t = null;

  document.querySelectorAll('#screen .snack').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (reduceMotion) return;
      const icon = document.querySelector(`#screen .p-${radio.value} svg`);
      chewItem.replaceChildren(icon.cloneNode(true));

      // restart the chew animations even if we're mid-chew
      screen.classList.remove('chewing');
      void screen.offsetWidth;
      screen.classList.add('chewing');

      clearTimeout(t);
      t = setTimeout(() => screen.classList.remove('chewing'), 900);
    });
  });
}
