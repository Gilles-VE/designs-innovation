// Glug site scripts

// Mark that JS is available, so the mobile menu only collapses when it can be opened again.
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.hd');
  const button = header && header.querySelector('.menu');
  const nav = header && header.querySelector('.nav');
  if (!button || !nav) return;

  const setOpen = (open) => {
    header.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    button.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
  };

  button.addEventListener('click', () => setOpen(!header.classList.contains('open')));

  // Close after picking a link, on Escape, and when resizing back to desktop.
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('open')) { setOpen(false); button.focus(); }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
});
